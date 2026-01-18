import { NextResponse } from "next/server";
import { and, eq, desc } from "drizzle-orm";
import withAuthRequired from "@/lib/auth/withAuthRequired";
import { db } from "@/db";
import { reviews } from "@/db/schema/reviews";
import { reviewResponses } from "@/db/schema/review-responses";
import { reviewDraftSchema } from "@/lib/validations/review-draft.schema";

export const GET = withAuthRequired(async (_req, context) => {
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

  const draft = await db
    .select({
      id: reviewResponses.id,
      responseText: reviewResponses.responseText,
      updatedAt: reviewResponses.updatedAt,
    })
    .from(reviewResponses)
    .where(
      and(
        eq(reviewResponses.reviewId, reviewId),
        eq(reviewResponses.userId, context.session.user.id),
        eq(reviewResponses.status, "draft")
      )
    )
    .orderBy(desc(reviewResponses.updatedAt))
    .limit(1)
    .then((rows) => rows[0]);

  if (!draft) {
    return NextResponse.json({ draft: null });
  }

  return NextResponse.json({
    draft: {
      ...draft,
      updatedAt: draft.updatedAt.toISOString(),
    },
  });
});

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
  const parsed = reviewDraftSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_payload",
          message: "Invalid draft payload",
        },
      },
      { status: 400 }
    );
  }

  const review = await db
    .select({ provider: reviews.provider })
    .from(reviews)
    .where(and(eq(reviews.id, reviewId), eq(reviews.userId, context.session.user.id)))
    .limit(1)
    .then((rows) => rows[0]);

  if (!review) {
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

  const now = new Date();
  const existingDraft = await db
    .select({ id: reviewResponses.id })
    .from(reviewResponses)
    .where(
      and(
        eq(reviewResponses.reviewId, reviewId),
        eq(reviewResponses.userId, context.session.user.id),
        eq(reviewResponses.status, "draft")
      )
    )
    .limit(1)
    .then((rows) => rows[0] ?? null);

  const draft = existingDraft
    ? await db
        .update(reviewResponses)
        .set({ responseText: parsed.data.response, updatedAt: now })
        .where(eq(reviewResponses.id, existingDraft.id))
        .returning({
          id: reviewResponses.id,
          responseText: reviewResponses.responseText,
          updatedAt: reviewResponses.updatedAt,
        })
        .then((rows) => rows[0])
    : await db
        .insert(reviewResponses)
        .values({
          reviewId,
          userId: context.session.user.id,
          provider: review.provider,
          responseText: parsed.data.response,
          status: "draft",
          updatedAt: now,
        })
        .returning({
          id: reviewResponses.id,
          responseText: reviewResponses.responseText,
          updatedAt: reviewResponses.updatedAt,
        })
        .then((rows) => rows[0]);

  return NextResponse.json({
    draft: {
      ...draft,
      updatedAt: draft.updatedAt.toISOString(),
    },
  });
});

export const PUT = withAuthRequired(async (req, context) => {
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
  const parsed = reviewDraftSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_payload",
          message: "Invalid draft payload",
        },
      },
      { status: 400 }
    );
  }

  const now = new Date();
  const updated = await db
    .update(reviewResponses)
    .set({ responseText: parsed.data.response, updatedAt: now })
    .where(
      and(
        eq(reviewResponses.reviewId, reviewId),
        eq(reviewResponses.userId, context.session.user.id),
        eq(reviewResponses.status, "draft")
      )
    )
    .returning({
      id: reviewResponses.id,
      responseText: reviewResponses.responseText,
      updatedAt: reviewResponses.updatedAt,
    })
    .then((rows) => rows[0]);

  if (!updated) {
    return NextResponse.json(
      {
        error: {
          code: "draft_not_found",
          message: "Draft not found",
        },
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    draft: {
      ...updated,
      updatedAt: updated.updatedAt.toISOString(),
    },
  });
});

export const DELETE = withAuthRequired(async (_req, context) => {
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

  const deleted = await db
    .delete(reviewResponses)
    .where(
      and(
        eq(reviewResponses.reviewId, reviewId),
        eq(reviewResponses.userId, context.session.user.id),
        eq(reviewResponses.status, "draft")
      )
    )
    .returning({ id: reviewResponses.id })
    .then((rows) => rows[0]);

  if (!deleted) {
    return NextResponse.json(
      {
        error: {
          code: "draft_not_found",
          message: "Draft not found",
        },
      },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, id: deleted.id });
});
