import { NextResponse } from "next/server";
import cronAuthRequired from "@/lib/auth/cronAuthRequired";
import { processReviewSyncJobs } from "@/lib/jobs/reviews-sync";

const handleReviewSync = async () => {
  try {
    const result = await processReviewSyncJobs();
    return NextResponse.json({
      success: true,
      message: "Review sync completed",
      processed: result.processed,
      inserted: result.inserted,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Review sync failed:", error);
    return NextResponse.json(
      {
        error: {
          code: "review_sync_failed",
          message: "Failed to process review sync jobs",
        },
      },
      { status: 500 }
    );
  }
};

export const GET = cronAuthRequired(handleReviewSync);
