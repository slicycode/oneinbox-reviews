import { auth, signIn } from "@/auth";
import { db } from "@/db";
import { reviews } from "@/db/schema/reviews";
import { reviewSyncStatus } from "@/db/schema/review-sync-status";
import { and, eq, desc, sql } from "drizzle-orm";
import { ReviewList } from "@/features/inbox/review-list";
import { ReviewSyncButton } from "@/features/inbox/review-sync-button";
import { appConfig } from "@/lib/config";

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

  const syncRow = await db
    .select({
      status: reviewSyncStatus.status,
      lastSuccessAt: reviewSyncStatus.lastSuccessAt,
      isStale: sql<boolean>`
        ${reviewSyncStatus.lastSuccessAt} IS NULL
        OR ${reviewSyncStatus.lastSuccessAt} < NOW() - (${appConfig.sync.staleHours} * INTERVAL '1 hour')
      `,
    })
    .from(reviewSyncStatus)
    .where(
      and(
        eq(reviewSyncStatus.userId, session.user.id),
        eq(reviewSyncStatus.provider, "google")
      )
    )
    .limit(1)
    .then((rows) => rows[0] ?? null);

  const syncStatus = syncRow
    ? syncRow.status === "failed"
      ? "failed"
      : syncRow.isStale
        ? "stale"
        : "active"
    : "stale";
  const lastSyncLabel = syncRow?.lastSuccessAt
    ? syncRow.lastSuccessAt.toISOString()
    : "Never";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
          <p className="text-sm text-muted-foreground">
            All reviews from connected platforms appear here.
          </p>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            <span>Sync status: {syncStatus}</span>
            <span>Last sync: {lastSyncLabel}</span>
          </div>
        </div>
        <ReviewSyncButton />
      </div>
      <ReviewList reviews={reviewData} />
    </div>
  );
}
