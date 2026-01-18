import { inngest } from "../client";
import { processAccountDeletionJobs } from "@/lib/jobs/account-deletion";

export const accountDeletionCron = inngest.createFunction(
  { id: "account-deletion-cron" },
  { cron: "0 * * * *" },
  async ({ logger }) => {
    try {
      const result = await processAccountDeletionJobs();
      return {
        message: "Account deletion jobs processed",
        processed: result.processed,
        processedAt: result.processedAt,
      };
    } catch (error) {
      logger.error("Account deletion cron failed", { error });
      throw error;
    }
  }
);
