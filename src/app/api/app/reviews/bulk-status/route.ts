import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import withAuthRequired from "@/lib/auth/withAuthRequired";
import { db } from "@/db";
import { reviews } from "@/db/schema/reviews";
import { reviewAuditLog } from "@/db/schema/review-audit-log";

const bulkStatusSchema = z.object({
  reviewIds: z.array(z.string()).min(1).max(100),
  status: z.enum(["unread", "responded", "needs_follow_up"]),
});

export const PATCH = withAuthRequired(async (req, context) => {
  const payload = await req.json().catch(() => null);
  const parsed = bulkStatusSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_payload",
          message: "Invalid bulk status update payload",
          details: parsed.error.flatten(),
        },
      },
      { status: 400 }
    );
  }

  const { reviewIds, status } = parsed.data;

  try {
    const result = await db.transaction(async (tx) => {
      // Get all reviews that belong to this user
      const userReviews = await tx
        .select({ id: reviews.id, status: reviews.status })
        .from(reviews)
        .where(
          and(
            inArray(reviews.id, reviewIds),
            eq(reviews.userId, context.session.user.id)
          )
        );

      if (userReviews.length === 0) {
        return { updated: 0, failed: reviewIds.length };
      }

      // Filter reviews that need updating
      const reviewsToUpdate = userReviews.filter((r) => r.status !== status);

      if (reviewsToUpdate.length === 0) {
        return { updated: 0, failed: 0, alreadySet: userReviews.length };
      }

      const idsToUpdate = reviewsToUpdate.map((r) => r.id);

      // Bulk update
      await tx
        .update(reviews)
        .set({ status, updatedAt: new Date() })
        .where(
          and(
            inArray(reviews.id, idsToUpdate),
            eq(reviews.userId, context.session.user.id)
          )
        );

      // Insert audit logs
      const auditLogs = reviewsToUpdate.map((review) => ({
        reviewId: review.id,
        userId: context.session.user.id,
        eventType: "status_change" as const,
        fromStatus: review.status,
        toStatus: status,
      }));

      await tx.insert(reviewAuditLog).values(auditLogs);

      const notFound = reviewIds.length - userReviews.length;

      return {
        updated: reviewsToUpdate.length,
        alreadySet: userReviews.length - reviewsToUpdate.length,
        failed: notFound,
      };
    });

    return NextResponse.json({
      success: true,
      status,
      ...result,
    });
  } catch (error) {
    console.error("Failed to bulk update review status:", error);
    return NextResponse.json(
      {
        error: {
          code: "bulk_status_update_failed",
          message: "Failed to update review statuses",
        },
      },
      { status: 500 }
    );
  }
});
