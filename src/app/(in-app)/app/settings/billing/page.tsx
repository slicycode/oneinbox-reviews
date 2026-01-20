import { auth, signIn } from "@/auth";
import { db } from "@/db";
import { subscriptions } from "@/db/schema/subscriptions";
import { reviews } from "@/db/schema/reviews";
import { eq, count } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, CreditCard } from "lucide-react";
import { getPlanConfig, type PlanTier } from "@/lib/plans/config";
import {
  isActiveSubscription,
  getStatusLabel,
} from "@/lib/subscriptions/state-machine";
import { BillingActions } from "./billing-actions";
import { PricingTableWrapper } from "./pricing-table-wrapper";
import { formatRetentionDays } from "@/lib/plans/format";

export default async function BillingSettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return signIn();
  }

  // Fetch subscription
  const subscriptionRow = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, session.user.id))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  // Fetch review count for usage
  const reviewCount = await db
    .select({ count: count() })
    .from(reviews)
    .where(eq(reviews.userId, session.user.id))
    .then((rows) => rows[0]?.count ?? 0);

  const hasActiveSubscription = subscriptionRow
    ? isActiveSubscription(subscriptionRow.status)
    : false;

  const currentTier: PlanTier = hasActiveSubscription
    ? ((subscriptionRow?.planTier as PlanTier) ?? "free")
    : "free";

  const planConfig = getPlanConfig(currentTier);
  const statusLabel = subscriptionRow
    ? getStatusLabel(subscriptionRow.status)
    : "Free Plan";

  // Calculate usage percentage
  const maxReviews = planConfig.limits.maxReviews;
  const usagePercent = maxReviews
    ? Math.min(100, Math.round((reviewCount / maxReviews) * 100))
    : 0;

  const isFreePlan = currentTier === "free";

  return (
    <div className="flex flex-col gap-6">
      {/* Current Plan Summary */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-lg">Current Plan</CardTitle>
                <CardDescription>{planConfig.description}</CardDescription>
              </div>
            </div>
            <Badge
              variant={hasActiveSubscription ? "default" : "secondary"}
              className="w-fit"
            >
              {statusLabel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{planConfig.name}</span>
              {planConfig.pricing.monthly.price > 0 && (
                <span className="text-muted-foreground">
                  ${(planConfig.pricing.monthly.price / 100).toFixed(0)}/month
                </span>
              )}
            </div>
            <BillingActions
              hasActiveSubscription={hasActiveSubscription}
              cancelAtPeriodEnd={subscriptionRow?.cancelAtPeriodEnd ?? false}
              currentTier={currentTier}
            />
          </div>

          {subscriptionRow?.currentPeriodEnd && hasActiveSubscription && (
            <p className="text-sm text-muted-foreground">
              {subscriptionRow.cancelAtPeriodEnd ? "Cancels on " : "Renews on "}
              {new Date(subscriptionRow.currentPeriodEnd).toLocaleDateString()}
            </p>
          )}

          {subscriptionRow?.trialEnd &&
            subscriptionRow.status === "trialing" && (
              <p className="text-sm text-amber-600">
                Trial ends on{" "}
                {new Date(subscriptionRow.trialEnd).toLocaleDateString()}
              </p>
            )}

          {/* Usage Stats */}
          <div className="grid gap-4 border-t pt-4 sm:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">Reviews</p>
              {maxReviews ? (
                <>
                  <p className="text-2xl font-bold">
                    {reviewCount}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{maxReviews}
                    </span>
                  </p>
                  <Progress value={usagePercent} className="h-1.5" />
                </>
              ) : (
                <p className="text-2xl font-bold">{reviewCount}</p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Data Retention</p>
              <p className="text-2xl font-bold">
                {formatRetentionDays(planConfig.limits.retentionDays)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Email Alerts</p>
              <p className="text-2xl font-bold">
                {planConfig.limits.emailAlertsEnabled ? (
                  <span className="text-green-600">Enabled</span>
                ) : (
                  <span className="text-muted-foreground">Disabled</span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Compare Plans
          </CardTitle>
          <CardDescription>
            Choose the plan that best fits your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PricingTableWrapper currentTier={currentTier} />
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium">Can I cancel anytime?</p>
            <p className="text-sm text-muted-foreground">
              Yes, you can cancel your subscription at any time. You&apos;ll
              continue to have access until the end of your billing period.
            </p>
          </div>
          <div>
            <p className="font-medium">
              What happens to my data if I downgrade?
            </p>
            <p className="text-sm text-muted-foreground">
              Your data is preserved, but access will be limited based on your
              new plan&apos;s limits (e.g., only the 50 most recent reviews on
              Free).
            </p>
          </div>
          <div>
            <p className="font-medium">Do you offer refunds?</p>
            <p className="text-sm text-muted-foreground">
              We offer a 14-day money-back guarantee if you&apos;re not
              satisfied with your subscription.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
