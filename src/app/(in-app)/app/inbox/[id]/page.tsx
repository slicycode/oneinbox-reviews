import { auth, signIn } from "@/auth";
import { db } from "@/db";
import { reviews } from "@/db/schema/reviews";
import { reviewResponses } from "@/db/schema/review-responses";
import { and, desc, eq, ne, sql } from "drizzle-orm";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReviewResponseForm } from "@/features/inbox/review-response-form";
import { getUserPlanLimits } from "@/lib/subscriptions/access-control";

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return signIn();
  }

  const { id } = await params;

  const review = await db
    .select({
      id: reviews.id,
      provider: reviews.provider,
      rating: reviews.rating,
      content: reviews.content,
      authorName: reviews.authorName,
      authorUrl: reviews.authorUrl,
      reviewUrl: reviews.reviewUrl,
      replyUrl: reviews.replyUrl,
      locationName: reviews.locationName,
      reviewCreatedAt: reviews.reviewCreatedAt,
    })
    .from(reviews)
    .where(and(eq(reviews.id, id), eq(reviews.userId, session.user.id)))
    .limit(1)
    .then((rows) => rows[0]);

  const responseRows = await db
    .select({
      id: reviewResponses.id,
      status: reviewResponses.status,
      responseText: reviewResponses.responseText,
      authorName: reviewResponses.authorName,
      authorEmail: reviewResponses.authorEmail,
      createdAt: reviewResponses.createdAt,
      sentAt: reviewResponses.sentAt,
    })
    .from(reviewResponses)
    .where(
      and(
        eq(reviewResponses.reviewId, id),
        eq(reviewResponses.userId, session.user.id),
        ne(reviewResponses.status, "draft"),
      ),
    )
    .orderBy(desc(reviewResponses.createdAt));

  const draftRow = await db
    .select({
      id: reviewResponses.id,
      responseText: reviewResponses.responseText,
      updatedAt: reviewResponses.updatedAt,
    })
    .from(reviewResponses)
    .where(
      and(
        eq(reviewResponses.reviewId, id),
        eq(reviewResponses.userId, session.user.id),
        eq(reviewResponses.status, "draft"),
      ),
    )
    .orderBy(desc(reviewResponses.updatedAt))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!review) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/app/inbox">Back to Inbox</Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Review not found</CardTitle>
            <CardDescription>
              This review may have been removed or you do not have access.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Check if this review is within the user's plan limit
  const planLimits = await getUserPlanLimits(session.user.id);
  if (planLimits.maxReviews !== null) {
    // Check if this review is among the user's allowed reviews (most recent N)
    const isWithinLimit = await db
      .select({ exists: sql<boolean>`true` })
      .from(
        db
          .select({ id: reviews.id })
          .from(reviews)
          .where(eq(reviews.userId, session.user.id))
          .orderBy(desc(reviews.reviewCreatedAt))
          .limit(planLimits.maxReviews)
          .as("allowed_reviews"),
      )
      .where(sql`allowed_reviews.id = ${id}`)
      .then((rows) => rows.length > 0);

    if (!isWithinLimit) {
      return (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/app/inbox">Back to Inbox</Link>
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Review not accessible</CardTitle>
              <CardDescription>
                This review is outside your plan&apos;s {planLimits.maxReviews}{" "}
                review limit. Upgrade to access all your reviews.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/app/settings/billing">Upgrade now</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // Check if this review is within the user's data retention period
  const retentionCutoffDate = new Date(
    Date.now() - planLimits.retentionDays * 24 * 60 * 60 * 1000,
  );
  if (review.reviewCreatedAt < retentionCutoffDate) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/app/inbox">Back to Inbox</Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Review not accessible</CardTitle>
            <CardDescription>
              This review is outside your plan&apos;s {planLimits.retentionDays}
              -day data retention period. Upgrade for longer data retention.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/app/settings/billing">Upgrade now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ownership check is handled in the query above.

  const responseData = responseRows.map((row) => ({
    ...row,
    status: row.status as "pending" | "sent" | "failed",
    createdAt: row.createdAt.toISOString(),
    sentAt: row.sentAt ? row.sentAt.toISOString() : null,
  }));
  const draftData = draftRow
    ? {
        ...draftRow,
        updatedAt: draftRow.updatedAt.toISOString(),
      }
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/app/inbox">Back to Inbox</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            {review.authorName || "Anonymous"} • {review.rating}★
          </CardTitle>
          <CardDescription>
            {review.reviewCreatedAt.toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Review</p>
            <p className="text-base">{review.content}</p>
          </div>
          {review.locationName ? (
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="text-base">{review.locationName}</p>
            </div>
          ) : null}
          {review.authorUrl ? (
            <div>
              <p className="text-sm text-muted-foreground">Author profile</p>
              <a
                href={review.authorUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline underline-offset-4"
              >
                View author
              </a>
            </div>
          ) : null}
          {review.reviewUrl ? (
            <div>
              <p className="text-sm text-muted-foreground">Review link</p>
              <a
                href={review.reviewUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline underline-offset-4"
              >
                View review
              </a>
            </div>
          ) : null}
          {review.replyUrl && review.provider === "google" ? (
            <div>
              <Button asChild variant="outline" size="sm">
                <a href={review.replyUrl} target="_blank" rel="noreferrer">
                  Reply on platform
                </a>
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
      <ReviewResponseForm
        reviewId={review.id}
        initialResponses={responseData}
        initialDraft={draftData}
      />
    </div>
  );
}
