import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import withAuthRequired from "@/lib/auth/withAuthRequired";
import { db } from "@/db";
import { reviews } from "@/db/schema/reviews";
import { reviewAuditLog } from "@/db/schema/review-audit-log";
import { reviewStatusSchema } from "@/lib/validations/review-status.schema";

export const PATCH = withAuthRequired(async (req, context) => {
  const params = await context.params;
  const reviewId = typeof params.id === "string" ? params.id : null;

  if (!reviewId) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_review_id",
          message: "Review id is required",
        },
      },
      { status: 400 }
    );
  }

  const payload = await req.json().catch(() => null);
  const parsed = reviewStatusSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_payload",
          message: "Invalid status update payload",
        },
      },
      { status: 400 }
    );
  }

  try {
    const result = await db.transaction(async (tx) => {
      const review = await tx
        .select({ status: reviews.status })
        .from(reviews)
        .where(
          and(eq(reviews.id, reviewId), eq(reviews.userId, context.session.user.id))
        )
        .limit(1)
        .then((rows) => rows[0]);

      if (!review) {
        return { notFound: true };
      }

      if (review.status === parsed.data.status) {
        return { status: review.status };
      }

      const updated = await tx
        .update(reviews)
        .set({ status: parsed.data.status, updatedAt: new Date() })
        .where(
          and(eq(reviews.id, reviewId), eq(reviews.userId, context.session.user.id))
        )
        .returning({ status: reviews.status })
        .then((rows) => rows[0]);

      if (!updated) {
        return { notFound: true };
      }

      await tx.insert(reviewAuditLog).values({
        reviewId,
        userId: context.session.user.id,
        eventType: "status_change",
        fromStatus: review.status,
        toStatus: updated.status,
      });

      return { status: updated.status };
    });

    if ("notFound" in result) {
      return NextResponse.json(
        {
          error: {
            code: "review_not_found",
            message: "Review not found",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ id: reviewId, status: result.status });
  } catch (error) {
    console.error("Failed to update review status:", error);
    return NextResponse.json(
      {
        error: {
          code: "review_status_update_failed",
          message: "Failed to update review status",
        },
      },
      { status: 500 }
    );
  }
});
