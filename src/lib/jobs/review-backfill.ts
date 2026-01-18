import { db } from "@/db";
import { reviewSyncJobs } from "@/db/schema/review-sync-job";
import { eq, inArray } from "drizzle-orm";
import { enqueueReviewSync } from "@/lib/jobs/reviews-sync";

type ReviewBackfillProcessResult = {
  processed: number;
  processedAt: string;
};

export const enqueueReviewBackfill = async (
  userId: string,
  provider: string,
  providerAccountId?: string
): ReturnType<typeof enqueueReviewSync> => {
  const payload = await enqueueReviewSync(
    userId,
    provider,
    "backfill",
    providerAccountId
  );

  console.log(
    JSON.stringify({
      level: "info",
      event: "review.sync.backfill.queued",
      context: payload,
    })
  );

  return payload;
};

export const processReviewBackfillJobs =
  async (): Promise<ReviewBackfillProcessResult> => {
    const pendingJobs = await db
      .select({
        id: reviewSyncJobs.id,
        userId: reviewSyncJobs.userId,
      })
      .from(reviewSyncJobs)
      .where(eq(reviewSyncJobs.status, "pending"));

    if (pendingJobs.length === 0) {
      return {
        processed: 0,
        processedAt: new Date().toISOString(),
      };
    }

    const now = new Date();
    await db
      .update(reviewSyncJobs)
      .set({
        status: "processed",
        processedAt: now,
        updatedAt: now,
      })
      .where(inArray(reviewSyncJobs.id, pendingJobs.map((job) => job.id)));

    return {
      processed: pendingJobs.length,
      processedAt: now.toISOString(),
    };
  };
