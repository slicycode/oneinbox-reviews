import { auth, signIn } from "@/auth";
import Link from "next/link";
import { db } from "@/db";
import { reviews } from "@/db/schema/reviews";
import { reviewExports } from "@/db/schema/review-exports";
import { reviewSyncStatus } from "@/db/schema/review-sync-status";
import { alertSettings } from "@/db/schema/alert-settings";
import { subscriptions } from "@/db/schema/subscriptions";
import { and, eq, desc, asc, sql, gte, lte } from "drizzle-orm";
import { ReviewList } from "@/features/inbox/review-list";
import { ReviewSyncButton } from "@/features/inbox/review-sync-button";
import { ReviewFilters } from "@/features/inbox/review-filters";
import { ExportHistory } from "@/features/inbox/export-history";
import { ExportCsvButton } from "@/features/inbox/export-csv-button";
import { EmailAlertsForm } from "@/features/alerts/email-alerts-form";
import { UpgradeBanner } from "@/components/ui/upgrade-banner";
import { appConfig } from "@/lib/config";
import { DEFAULT_NEGATIVE_REVIEW_THRESHOLD } from "@/lib/alerts/constants";
import {
  reviewFiltersSchema,
  type ReviewFiltersInput,
} from "@/lib/validations/review-filters.schema";
import { getInboxSyncSummary } from "@/lib/reviews/sync-summary";
import { isActiveSubscription } from "@/lib/subscriptions/state-machine";
import { getUserPlanLimits } from "@/lib/subscriptions/access-control";

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
    status: rawParams.status,
    sortBy: rawParams.sort,
  });
  const filters: ReviewFiltersInput = parsedFilters.success
    ? parsedFilters.data
    : {};

  const exportParams = new URLSearchParams();
  for (const [key, value] of Object.entries(rawParams)) {
    if (value === undefined) {
      continue;
    }
    if (Array.isArray(value)) {
      value.forEach((entry) => exportParams.append(key, entry));
    } else {
      exportParams.append(key, value);
    }
  }
  const exportHref = exportParams.toString()
    ? `/api/app/reviews/export?${exportParams.toString()}`
    : "/api/app/reviews/export";

  // Get user's plan limits for review enforcement
  const planLimits = await getUserPlanLimits(session.user.id);
  const reviewLimit = planLimits.maxReviews ?? 1000; // Default to 1000 if unlimited

  // Calculate retention cutoff date
  const retentionCutoffDate = new Date(
    Date.now() - planLimits.retentionDays * 24 * 60 * 60 * 1000,
  );

  const conditions = [
    eq(reviews.userId, session.user.id),
    // Enforce data retention - only show reviews within retention period
    gte(reviews.reviewCreatedAt, retentionCutoffDate),
  ];
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
      sql`${reviews.content} ILIKE ${term} OR COALESCE(${reviews.authorName}, '') ILIKE ${term}`,
    );
  }
  if (filters.status) {
    conditions.push(eq(reviews.status, filters.status));
  }

  // Get total review count for the user (without filters)
  const totalReviewCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reviews)
    .where(eq(reviews.userId, session.user.id))
    .then((rows) => rows[0]?.count ?? 0);

  // Determine sort order
  const getOrderBy = () => {
    switch (filters.sortBy) {
      case "date_oldest":
        return asc(reviews.reviewCreatedAt);
      case "rating_highest":
        return desc(reviews.rating);
      case "rating_lowest":
        return asc(reviews.rating);
      case "date_newest":
      default:
        return desc(reviews.reviewCreatedAt);
    }
  };

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
    .orderBy(getOrderBy())
    .limit(reviewLimit);

  const reviewData = reviewRows.map((row) => ({
    ...row,
    reviewCreatedAt: row.reviewCreatedAt.toISOString(),
  }));

  const exportRows = await db
    .select({
      id: reviewExports.id,
      status: reviewExports.status,
      rowCount: reviewExports.rowCount,
      queryParams: reviewExports.queryParams,
      createdAt: reviewExports.createdAt,
      completedAt: reviewExports.completedAt,
    })
    .from(reviewExports)
    .where(eq(reviewExports.userId, session.user.id))
    .orderBy(desc(reviewExports.createdAt))
    .limit(5);

  const exportHistory = exportRows.map((row) => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
  }));

  const syncRow = await db
    .select({
      status: reviewSyncStatus.status,
      lastSuccessAt: reviewSyncStatus.lastSuccessAt,
      lastAttemptAt: reviewSyncStatus.lastAttemptAt,
      lastError: reviewSyncStatus.lastError,
      isStale: sql<boolean>`
        ${reviewSyncStatus.lastSuccessAt} IS NULL
        OR ${reviewSyncStatus.lastSuccessAt} < NOW() - (${appConfig.sync.staleHours} * INTERVAL '1 hour')
      `,
    })
    .from(reviewSyncStatus)
    .where(
      and(
        eq(reviewSyncStatus.userId, session.user.id),
        eq(reviewSyncStatus.provider, "google"),
      ),
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
  const syncSummary = getInboxSyncSummary({
    status: syncStatus,
    lastError: syncRow?.lastError ?? null,
    hasSync: Boolean(syncRow),
  });
  const lastSyncLabel = syncRow?.lastSuccessAt
    ? syncRow.lastSuccessAt.toLocaleString()
    : "Not yet";
  const cooldownSeconds = (() => {
    if (!syncRow?.lastAttemptAt) {
      return null;
    }
    const cooldownMs = 5 * 60 * 1000;
    const elapsed = Date.now() - syncRow.lastAttemptAt.getTime();
    if (elapsed >= cooldownMs) {
      return null;
    }
    return Math.ceil((cooldownMs - elapsed) / 1000);
  })();

  const alertSettingsRow = await db
    .select({
      emailAlertsEnabled: alertSettings.emailAlertsEnabled,
      negativeReviewThreshold: alertSettings.negativeReviewThreshold,
      alertsPaused: alertSettings.alertsPaused,
    })
    .from(alertSettings)
    .where(eq(alertSettings.userId, session.user.id))
    .limit(1)
    .then((rows) => rows[0] ?? null);
  const emailAlertsEnabled = alertSettingsRow?.emailAlertsEnabled ?? false;
  const negativeReviewThreshold =
    alertSettingsRow?.negativeReviewThreshold ??
    DEFAULT_NEGATIVE_REVIEW_THRESHOLD;
  const alertsPaused = alertSettingsRow?.alertsPaused ?? false;

  // Fetch subscription for upgrade banner
  const subscriptionRow = await db
    .select({
      status: subscriptions.status,
      planTier: subscriptions.planTier,
    })
    .from(subscriptions)
    .where(eq(subscriptions.userId, session.user.id))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  const isFreePlan =
    !subscriptionRow || !isActiveSubscription(subscriptionRow.status);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
          <p className="text-sm text-muted-foreground">
            All reviews from connected platforms appear here, newest first.
          </p>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            <span>Sync status: {syncSummary.label}</span>
            <span>Last sync: {lastSyncLabel}</span>
            {syncSummary.helperText ? (
              <span className="text-amber-600">
                {syncSummary.helperText}
                {syncSummary.showIntegrationsLink ? (
                  <>
                    {" "}
                    <Link className="underline" href="/app/integrations">
                      Go to integrations
                    </Link>
                  </>
                ) : null}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportCsvButton href={exportHref} />
          <ReviewSyncButton initialCooldownSeconds={cooldownSeconds} />
        </div>
      </div>
      {isFreePlan && (
        <UpgradeBanner
          feature="Unlimited reviews and email alerts"
          currentPlan="Free"
          message="Upgrade for unlimited reviews and email alerts"
        />
      )}
      <ReviewFilters defaultValues={filters} />
      <EmailAlertsForm
        initialEnabled={emailAlertsEnabled}
        initialThreshold={negativeReviewThreshold}
        initialPaused={alertsPaused}
        isFreePlan={isFreePlan}
      />
      <ExportHistory items={exportHistory} />
      <ReviewList
        reviews={reviewData}
        totalCount={totalReviewCount}
        limit={planLimits.maxReviews}
        isFreePlan={isFreePlan}
        retentionDays={planLimits.retentionDays}
      />
    </div>
  );
}
