import { inngest } from "../client";
import { processReviewBackfillJobs } from "@/lib/jobs/review-backfill";

export const reviewBackfillCron = inngest.createFunction(
  { id: "review-backfill-cron" },
  { cron: "*/10 * * * *" },
  async ({ logger }) => {
    try {
      const result = await processReviewBackfillJobs();
      return {
        message: "Review backfill jobs processed",
        processed: result.processed,
        processedAt: result.processedAt,
      };
    } catch (error) {
      logger.error("Review backfill cron failed", { error });
      throw error;
    }
  }
);
