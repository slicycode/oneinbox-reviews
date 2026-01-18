import { inngest } from "../client";
import { processReviewSyncJobs } from "@/lib/jobs/reviews-sync";

export const reviewsSyncCron = inngest.createFunction(
  { id: "reviews-sync-cron" },
  { cron: "*/30 * * * *" },
  async ({ logger }) => {
    try {
      const result = await processReviewSyncJobs();
      return {
        message: "Review sync completed",
        processed: result.processed,
        inserted: result.inserted,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Review sync cron failed", { error });
      throw error;
    }
  }
);
