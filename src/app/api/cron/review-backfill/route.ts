import { NextResponse } from "next/server";
import cronAuthRequired from "@/lib/auth/cronAuthRequired";
import { processReviewBackfillJobs } from "@/lib/jobs/review-backfill";

const handleReviewBackfillJobs = async () => {
  const result = await processReviewBackfillJobs();
  const message =
    result.processed === 0
      ? "No review backfill jobs to process"
      : "Review backfill jobs processed";

  return NextResponse.json({
    success: true,
    message,
    processed: result.processed,
    processedAt: result.processedAt,
  });
};

export const GET = cronAuthRequired(handleReviewBackfillJobs);
