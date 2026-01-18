import { auth, signIn } from "@/auth";
import { db } from "@/db";
import { reviews } from "@/db/schema/reviews";
import { eq, desc } from "drizzle-orm";
import { ReviewList } from "@/features/inbox/review-list";
import { ReviewSyncButton } from "@/features/inbox/review-sync-button";

export default async function InboxPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return signIn();
  }

  const reviewRows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      content: reviews.content,
      authorName: reviews.authorName,
      reviewCreatedAt: reviews.reviewCreatedAt,
    })
    .from(reviews)
    .where(eq(reviews.userId, session.user.id))
    .orderBy(desc(reviews.reviewCreatedAt))
    .limit(50);

  const reviewData = reviewRows.map((row) => ({
    ...row,
    reviewCreatedAt: row.reviewCreatedAt.toISOString(),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
          <p className="text-sm text-muted-foreground">
            All reviews from connected platforms appear here.
          </p>
        </div>
        <ReviewSyncButton />
      </div>
      <ReviewList reviews={reviewData} />
    </div>
  );
}
