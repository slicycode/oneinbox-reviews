import { auth, signIn } from "@/auth";
import { db } from "@/db";
import { reviews } from "@/db/schema/reviews";
import { and, eq } from "drizzle-orm";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
      rating: reviews.rating,
      content: reviews.content,
      authorName: reviews.authorName,
      authorUrl: reviews.authorUrl,
      reviewUrl: reviews.reviewUrl,
      locationName: reviews.locationName,
      reviewCreatedAt: reviews.reviewCreatedAt,
    })
    .from(reviews)
    .where(and(eq(reviews.id, id), eq(reviews.userId, session.user.id)))
    .limit(1)
    .then((rows) => rows[0]);

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

  // Ownership check is handled in the query above.

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
        </CardContent>
      </Card>
    </div>
  );
}
