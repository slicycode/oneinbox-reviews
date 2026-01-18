import { auth, signIn } from "@/auth";
import { db } from "@/db";
import { reviews } from "@/db/schema/reviews";
import { reviewSyncStatus } from "@/db/schema/review-sync-status";
import { alertSettings } from "@/db/schema/alert-settings";
import { and, eq, desc, sql, gte, lte } from "drizzle-orm";
import { ReviewList } from "@/features/inbox/review-list";
import { ReviewSyncButton } from "@/features/inbox/review-sync-button";
import { ReviewFilters } from "@/features/inbox/review-filters";
import { EmailAlertsForm } from "@/features/alerts/email-alerts-form";
import { appConfig } from "@/lib/config";
import {
  reviewFiltersSchema,
  type ReviewFiltersInput,
} from "@/lib/validations/review-filters.schema";

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return signIn();
  }

  const rawParams = await searchParams;
  const parsedFilters = reviewFiltersSchema.safeParse({
    ratingMin: rawParams.rating_min,
    ratingMax: rawParams.rating_max,
    dateFrom: rawParams.date_from,
    dateTo: rawParams.date_to,
    query: rawParams.q,
  });
  const filters: ReviewFiltersInput = parsedFilters.success
    ? parsedFilters.data
    : {};

  const conditions = [eq(reviews.userId, session.user.id)];
  if (filters.ratingMin !== undefined) {
    conditions.push(gte(reviews.rating, filters.ratingMin));
  }
  if (filters.ratingMax !== undefined) {
    conditions.push(lte(reviews.rating, filters.ratingMax));
  }
  if (filters.dateFrom) {
    conditions.push(gte(reviews.reviewCreatedAt, filters.dateFrom));
  }
  if (filters.dateTo) {
    conditions.push(lte(reviews.reviewCreatedAt, filters.dateTo));
  }
  if (filters.query) {
    const term = `%${filters.query}%`;
    conditions.push(
      sql`${reviews.content} ILIKE ${term} OR COALESCE(${reviews.authorName}, '') ILIKE ${term}`
    );
  }

  const reviewRows = await db
    .select({
      id: reviews.id,
      status: reviews.status,
      rating: reviews.rating,
      content: reviews.content,
      authorName: reviews.authorName,
      reviewCreatedAt: reviews.reviewCreatedAt,
    })
    .from(reviews)
    .where(and(...conditions))
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

  const alertSettingsRow = await db
    .select({
      emailAlertsEnabled: alertSettings.emailAlertsEnabled,
      negativeReviewThreshold: alertSettings.negativeReviewThreshold,
    })
    .from(alertSettings)
    .where(eq(alertSettings.userId, session.user.id))
    .limit(1)
    .then((rows) => rows[0] ?? null);
  const emailAlertsEnabled = alertSettingsRow?.emailAlertsEnabled ?? false;
  const negativeReviewThreshold = alertSettingsRow?.negativeReviewThreshold ?? 2;

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
      <ReviewFilters defaultValues={filters} />
      <EmailAlertsForm
        initialEnabled={emailAlertsEnabled}
        initialThreshold={negativeReviewThreshold}
      />
      <ReviewList reviews={reviewData} />
    </div>
  );
}
