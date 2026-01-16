import { NextResponse } from "next/server";
import { db } from "@/db";
import { reviewSyncJobs } from "@/db/schema/review-sync-job";
import { eq, inArray } from "drizzle-orm";
import cronAuthRequired from "@/lib/auth/cronAuthRequired";

const handleReviewBackfillJobs = async () => {
  const pendingJobs = await db
    .select({
      id: reviewSyncJobs.id,
      userId: reviewSyncJobs.userId,
    })
    .from(reviewSyncJobs)
    .where(eq(reviewSyncJobs.status, "pending"));

  if (pendingJobs.length === 0) {
    return NextResponse.json({
      success: true,
      message: "No review backfill jobs to process",
      processedAt: new Date().toISOString(),
      processed: 0,
    });
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

  return NextResponse.json({
    success: true,
    message: "Review backfill jobs processed",
    processed: pendingJobs.length,
    processedAt: now.toISOString(),
  });
};

export const GET = cronAuthRequired(handleReviewBackfillJobs);
