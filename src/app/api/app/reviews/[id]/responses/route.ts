import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import withAuthRequired from "@/lib/auth/withAuthRequired";
import { db } from "@/db";
import { reviews } from "@/db/schema/reviews";
import { reviewResponses } from "@/db/schema/review-responses";
import { reviewResponseSchema } from "@/lib/validations/review-response.schema";

const normalizeProviderStatus = (provider: string) => {
  if (provider !== "google") {
    return "pending";
  }
  return "sent";
};

export const POST = withAuthRequired(async (req, context) => {
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
  const parsed = reviewResponseSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_payload",
          message: "Invalid response payload",
        },
      },
      { status: 400 }
    );
  }

  try {
    const result = await db.transaction(async (tx) => {
      const review = await tx
        .select({ provider: reviews.provider })
        .from(reviews)
        .where(
          and(eq(reviews.id, reviewId), eq(reviews.userId, context.session.user.id))
        )
        .limit(1)
        .then((rows) => rows[0]);

      if (!review) {
        return { notFound: true as const };
      }

      const initialStatus = normalizeProviderStatus(review.provider);
      const now = new Date();

      const inserted = await tx
        .insert(reviewResponses)
        .values({
          reviewId,
          userId: context.session.user.id,
          provider: review.provider,
          responseText: parsed.data.response,
          status: initialStatus,
          sentAt: initialStatus === "sent" ? now : null,
        })
        .returning({
          id: reviewResponses.id,
          status: reviewResponses.status,
          responseText: reviewResponses.responseText,
          createdAt: reviewResponses.createdAt,
          sentAt: reviewResponses.sentAt,
        })
        .then((rows) => rows[0]);

      return { response: inserted };
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

    return NextResponse.json({
      response: {
        ...result.response,
        createdAt: result.response.createdAt.toISOString(),
        sentAt: result.response.sentAt
          ? result.response.sentAt.toISOString()
          : null,
      },
    });
  } catch (error) {
    console.error("Failed to create review response:", error);
    return NextResponse.json(
      {
        error: {
          code: "review_response_failed",
          message: "Failed to create review response",
        },
      },
      { status: 500 }
    );
  }
});
