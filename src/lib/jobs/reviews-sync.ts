import { db } from "@/db";
import { reviewSyncJobs } from "@/db/schema/review-sync-job";
import { reviewSyncStatus } from "@/db/schema/review-sync-status";
import { accounts } from "@/db/schema/user";
import { sendNewReviewAlert } from "@/lib/alerts/send-new-review-alert";
import { and, eq } from "drizzle-orm";

type ReviewSyncJob = {
  id: string;
  userId: string;
  provider: string;
  jobType: "initial" | "backfill" | "manual";
  status: string;
  requestedAt: string;
  event: "review.sync.queued";
};

export const enqueueReviewSync = async (
  userId: string,
  provider: string,
  jobType: "initial" | "backfill" | "manual",
  providerAccountId?: string
): Promise<ReviewSyncJob> => {
  const now = new Date();
  const idempotencyKey = `${userId}:${provider}:${providerAccountId ?? "unknown"}:${jobType}`;

  const job = await db
    .insert(reviewSyncJobs)
    .values({
      userId,
      provider,
      jobType,
      status: "pending",
      idempotencyKey,
      requestedAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: reviewSyncJobs.idempotencyKey,
      set: {
        status: "pending",
        requestedAt: now,
        updatedAt: now,
        error: null,
      },
    })
    .returning()
    .then((rows) => rows[0]);

  const payload: ReviewSyncJob = {
    id: job.id,
    userId: job.userId,
    provider: job.provider,
    jobType,
    status: job.status,
    requestedAt: job.requestedAt.toISOString(),
    event: "review.sync.queued",
  };

  console.log(
    JSON.stringify({ level: "info", event: payload.event, context: payload })
  );

  return payload;
};

const ingestGoogleReviews = async (userId: string) => {
  const googleAccount = await db
    .select({ providerAccountId: accounts.providerAccountId })
    .from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.provider, "google")))
    .limit(1)
    .then((rows) => rows[0]);

  if (!googleAccount) {
    return 0;
  }

  // TODO: Implement actual Google Business Profile API ingestion.
  return 0;
};

const upsertSyncStatus = async (params: {
  userId: string;
  provider: string;
  status: "active" | "failed" | "stale";
  lastSuccessAt?: Date | null;
  lastAttemptAt: Date;
  lastError?: string | null;
}) => {
  const now = params.lastAttemptAt;
  await db
    .insert(reviewSyncStatus)
    .values({
      userId: params.userId,
      provider: params.provider,
      status: params.status,
      lastSuccessAt: params.lastSuccessAt ?? null,
      lastAttemptAt: params.lastAttemptAt,
      lastError: params.lastError ?? null,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [reviewSyncStatus.userId, reviewSyncStatus.provider],
      set: {
        status: params.status,
        lastSuccessAt: params.lastSuccessAt ?? null,
        lastAttemptAt: params.lastAttemptAt,
        lastError: params.lastError ?? null,
        updatedAt: now,
      },
    });
};

export const processReviewSyncJobs = async (options?: { userId?: string }) => {
  const whereClause = options?.userId
    ? and(
        eq(reviewSyncJobs.status, "pending"),
        eq(reviewSyncJobs.userId, options.userId)
      )
    : eq(reviewSyncJobs.status, "pending");
  const pendingJobs = await db
    .select()
    .from(reviewSyncJobs)
    .where(whereClause);

  if (pendingJobs.length === 0) {
    return {
      processed: 0,
      inserted: 0,
    };
  }

  let processed = 0;
  let inserted = 0;
  for (const job of pendingJobs) {
    const jobStartedAt = new Date();
    processed += 1;
    await db
      .update(reviewSyncJobs)
      .set({ status: "processing", updatedAt: jobStartedAt })
      .where(eq(reviewSyncJobs.id, job.id));

    try {
      let insertedCount = 0;
      if (job.provider === "google") {
        insertedCount = await ingestGoogleReviews(job.userId);
      }

      inserted += insertedCount;
      if (insertedCount > 0) {
        void sendNewReviewAlert({
          userId: job.userId,
          provider: job.provider,
          insertedCount,
          since: jobStartedAt,
        }).catch((error) => {
          console.error("Failed to send review alert:", error);
        });
      }

      const nextStatus = "active";
      const lastSuccessAt = jobStartedAt;

      await db
        .update(reviewSyncJobs)
        .set({
          status: "processed",
          processedAt: jobStartedAt,
          updatedAt: jobStartedAt,
        })
        .where(eq(reviewSyncJobs.id, job.id));

      await upsertSyncStatus({
        userId: job.userId,
        provider: job.provider,
        status: nextStatus,
        lastSuccessAt,
        lastAttemptAt: jobStartedAt,
      });

    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      await db
        .update(reviewSyncJobs)
        .set({
          status: "error",
          error: message,
          updatedAt: jobStartedAt,
        })
        .where(eq(reviewSyncJobs.id, job.id));

      await upsertSyncStatus({
        userId: job.userId,
        provider: job.provider,
        status: "failed",
        lastAttemptAt: jobStartedAt,
        lastError: message,
      });

    }
  }

  return { processed, inserted };
};
