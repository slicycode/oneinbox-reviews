import { db } from "@/db";
import { reviewSyncJobs } from "@/db/schema/review-sync-job";

type ReviewBackfillJob = {
  id: string;
  userId: string;
  provider: string;
  jobType: "backfill";
  status: string;
  requestedAt: string;
  event: "review.sync.backfill.queued";
};

export const enqueueReviewBackfill = async (
  userId: string,
  provider: string
): Promise<ReviewBackfillJob> => {
  const now = new Date();
  const jobType = "backfill";
  const idempotencyKey = `${userId}:${provider}:${jobType}`;

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

  const payload: ReviewBackfillJob = {
    id: job.id,
    userId: job.userId,
    provider: job.provider,
    jobType,
    status: job.status,
    requestedAt: job.requestedAt.toISOString(),
    event: "review.sync.backfill.queued",
  };

  console.log(
    JSON.stringify({ level: "info", event: payload.event, context: payload })
  );

  return payload;
};
