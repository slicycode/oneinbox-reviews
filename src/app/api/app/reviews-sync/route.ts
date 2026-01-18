import { NextResponse } from "next/server";
import withAuthRequired from "@/lib/auth/withAuthRequired";
import { enqueueReviewSync, processReviewSyncJobs } from "@/lib/jobs/reviews-sync";
import { db } from "@/db";
import { accounts } from "@/db/schema/user";
import { and, eq } from "drizzle-orm";

export const POST = withAuthRequired(async (_req, context) => {
  try {
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
