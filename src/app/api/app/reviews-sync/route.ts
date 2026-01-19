import { NextResponse } from "next/server";
import withAuthRequired from "@/lib/auth/withAuthRequired";
import { enqueueReviewSync, processReviewSyncJobs } from "@/lib/jobs/reviews-sync";
import { db } from "@/db";
import { accounts } from "@/db/schema/user";
import { reviewSyncStatus } from "@/db/schema/review-sync-status";
import { and, eq } from "drizzle-orm";

export const POST = withAuthRequired(async (_req, context) => {
  try {
    const cooldownMinutes = 5;
    const cooldownMs = cooldownMinutes * 60 * 1000;
    const now = new Date();

    const googleAccount = await db
      .select({ providerAccountId: accounts.providerAccountId })
      .from(accounts)
      .where(
        and(
          eq(accounts.userId, context.session.user.id),
          eq(accounts.provider, "google")
        )
      )
      .limit(1)
      .then((rows) => rows[0]);

    if (!googleAccount) {
      return NextResponse.json(
        {
          error: {
            code: "google_not_connected",
            message: "Connect Google before syncing reviews",
          },
        },
        { status: 400 }
      );
    }

    const lastSync = await db
      .select({ lastAttemptAt: reviewSyncStatus.lastAttemptAt })
      .from(reviewSyncStatus)
      .where(
        and(
          eq(reviewSyncStatus.userId, context.session.user.id),
          eq(reviewSyncStatus.provider, "google")
        )
      )
      .limit(1)
      .then((rows) => rows[0]);

    if (lastSync?.lastAttemptAt) {
      const elapsed = now.getTime() - lastSync.lastAttemptAt.getTime();
      if (elapsed < cooldownMs) {
        const remainingSeconds = Math.ceil((cooldownMs - elapsed) / 1000);
        return NextResponse.json(
          {
            error: {
              code: "review_sync_rate_limited",
              message: `Please wait ${remainingSeconds}s before refreshing again.`,
              retryAfterSeconds: remainingSeconds,
            },
          },
          { status: 429 }
        );
      }
    }

    await enqueueReviewSync(
      context.session.user.id,
      "google",
      "manual",
      googleAccount.providerAccountId
    );
    const result = await processReviewSyncJobs({
      userId: context.session.user.id,
    });

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
});
