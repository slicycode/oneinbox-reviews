import { auth, signIn } from "@/auth";
import Link from "next/link";
import { db } from "@/db";
import { reviews } from "@/db/schema/reviews";
import { subscriptions } from "@/db/schema/subscriptions";
import { eq, desc, sql, gte, and } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Star,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  RefreshCw,
  Settings,
  Zap,
} from "lucide-react";
import { isActiveSubscription } from "@/lib/subscriptions/state-machine";
import { getUserPlanLimits } from "@/lib/subscriptions/access-control";
import { getPlanConfig, type PlanTier } from "@/lib/plans/config";
import { formatReviewCount, formatReviewLimit } from "@/lib/plans/format";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return signIn();
  }

  const userId = session.user.id;

  // Get user's plan info
  const subscriptionRow = await db
    .select({
      status: subscriptions.status,
      planTier: subscriptions.planTier,
    })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  const hasActiveSubscription = subscriptionRow
    ? isActiveSubscription(subscriptionRow.status)
    : false;

  const currentTier: PlanTier = hasActiveSubscription
    ? ((subscriptionRow?.planTier as PlanTier) ?? "free")
    : "free";

  const planConfig = getPlanConfig(currentTier);
  const planLimits = await getUserPlanLimits(userId);

  // Calculate retention cutoff date
  const retentionCutoffDate = new Date(
    Date.now() - planLimits.retentionDays * 24 * 60 * 60 * 1000,
  );

  // Get total reviews count (within retention)
  const totalReviews = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reviews)
    .where(
      and(
        eq(reviews.userId, userId),
        gte(reviews.reviewCreatedAt, retentionCutoffDate),
      ),
    )
    .then((rows) => rows[0]?.count ?? 0);

  // Get average rating
  const avgRating = await db
    .select({ avg: sql<number>`COALESCE(AVG(${reviews.rating}), 0)` })
    .from(reviews)
    .where(
      and(
        eq(reviews.userId, userId),
        gte(reviews.reviewCreatedAt, retentionCutoffDate),
      ),
    )
    .then((rows) => Number(rows[0]?.avg ?? 0));

  // Get reviews from last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentReviewsCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reviews)
    .where(
      and(
        eq(reviews.userId, userId),
        gte(reviews.reviewCreatedAt, sevenDaysAgo),
      ),
    )
    .then((rows) => rows[0]?.count ?? 0);

  // Get reviews from previous 7 days for comparison
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const previousWeekReviews = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reviews)
    .where(
      and(
        eq(reviews.userId, userId),
        gte(reviews.reviewCreatedAt, fourteenDaysAgo),
        sql`${reviews.reviewCreatedAt} < ${sevenDaysAgo.toISOString()}`,
      ),
    )
    .then((rows) => rows[0]?.count ?? 0);

  // Calculate trend
  const reviewTrend =
    previousWeekReviews > 0
      ? ((recentReviewsCount - previousWeekReviews) / previousWeekReviews) * 100
      : recentReviewsCount > 0
        ? 100
        : 0;

  // Get rating distribution
  const ratingDistribution = await db
    .select({
      rating: reviews.rating,
      count: sql<number>`count(*)::int`,
    })
    .from(reviews)
    .where(
      and(
        eq(reviews.userId, userId),
        gte(reviews.reviewCreatedAt, retentionCutoffDate),
      ),
    )
    .groupBy(reviews.rating)
    .then((rows) => {
      const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      rows.forEach((row) => {
        dist[row.rating] = row.count;
      });
      return dist;
    });

  // Get most recent reviews (limit 5)
  const recentReviewRows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      content: reviews.content,
      authorName: reviews.authorName,
    })
    .from(reviews)
    .where(
      and(
        eq(reviews.userId, userId),
        gte(reviews.reviewCreatedAt, retentionCutoffDate),
      ),
    )
    .orderBy(desc(reviews.reviewCreatedAt))
    .limit(5);

  const recentReviews = recentReviewRows.map((row) => ({
    ...row,
    content: row.content ?? "",
    authorName: row.authorName ?? null,
  }));

  // Calculate usage percentage
  const maxReviews = planLimits.maxReviews;
  const usagePercent = maxReviews
    ? Math.min(100, Math.round((totalReviews / maxReviews) * 100))
    : 0;

  const isFreePlan = currentTier === "free";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your review management.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/app/inbox">
              <MessageSquare className="mr-2 h-4 w-4" />
              View Inbox
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/app/integrations">
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Reviews
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Reviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              {maxReviews ? `of ${formatReviewLimit(maxReviews)}` : "Unlimited"}
            </p>
          </CardContent>
        </Card>

        {/* Average Rating */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">out of 5 stars</p>
          </CardContent>
        </Card>

        {/* Reviews This Week */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            {reviewTrend >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentReviewsCount}</div>
            <p className="text-xs text-muted-foreground">
              {reviewTrend >= 0 ? "+" : ""}
              {reviewTrend.toFixed(0)}% from last week
            </p>
          </CardContent>
        </Card>

        {/* Plan Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plan</CardTitle>
            <Badge variant={isFreePlan ? "secondary" : "default"}>
              {planConfig.name}
            </Badge>
          </CardHeader>
          <CardContent>
            {maxReviews ? (
              <>
                <Progress value={usagePercent} className="h-2" />
                <p className="mt-2 text-xs text-muted-foreground">
                  {usagePercent}% used (
                  {formatReviewCount(totalReviews, maxReviews)})
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {formatReviewLimit(null)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
            <CardDescription>
              Breakdown of reviews by star rating
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingDistribution[star];
              const percent =
                totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="w-12 text-sm">{star} star</span>
                  <Progress value={percent} className="h-2 flex-1" />
                  <span className="w-12 text-right text-sm text-muted-foreground">
                    {count}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>Latest reviews from your inbox</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/app/inbox">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No reviews yet. Connect Google to start syncing.
              </p>
            ) : (
              <div className="space-y-4">
                {recentReviews.map((review) => (
                  <Link
                    key={review.id}
                    href={`/app/inbox/${review.id}`}
                    className="block rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {review.authorName || "Anonymous"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {"★".repeat(review.rating)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {review.content || "No content"}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/app/inbox">
                <MessageSquare className="mr-2 h-4 w-4" />
                View Inbox
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/app/integrations">
                <RefreshCw className="mr-2 h-4 w-4" />
                Manage Integrations
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/app/settings/billing">
                <Settings className="mr-2 h-4 w-4" />
                Billing Settings
              </Link>
            </Button>
            {isFreePlan && (
              <Button asChild className="justify-start">
                <Link href="/app/settings/billing">
                  <Zap className="mr-2 h-4 w-4" />
                  Upgrade Plan
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
