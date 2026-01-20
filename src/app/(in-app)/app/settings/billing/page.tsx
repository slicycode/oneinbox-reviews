import { auth, signIn } from "@/auth";
import { db } from "@/db";
import { subscriptions } from "@/db/schema/subscriptions";
import { reviews } from "@/db/schema/reviews";
import { eq, count } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, X, Sparkles, CreditCard } from "lucide-react";
import { getPlanConfig, plansConfig, type PlanTier } from "@/lib/plans/config";
import {
  isActiveSubscription,
  getStatusLabel,
} from "@/lib/subscriptions/state-machine";
import { BillingActions } from "./billing-actions";
import { UpgradeButton } from "./upgrade-button";
import { cn } from "@/lib/utils";

// Feature comparison data
const planFeatures = [
  {
    name: "Reviews",
    free: "50 reviews",
    starter: "Unlimited",
  },
  {
    name: "Data retention",
    free: "30 days",
    starter: "365 days",
  },
  {
    name: "Google accounts",
    free: "1 account",
    starter: "1 account",
  },
  {
    name: "Email alerts",
    free: false,
    starter: true,
  },
  {
    name: "Advanced filters",
    free: false,
    starter: true,
  },
  {
    name: "CSV export",
    free: true,
    starter: true,
  },
  {
    name: "Review response drafts",
    free: true,
    starter: true,
  },
];

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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Billing & Subscription
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and view your usage.
        </p>
      </div>

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
                {planConfig.limits.retentionDays}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  days
                </span>
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
          {/* Plan Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-4 text-left font-medium">Feature</th>
                  <th className="pb-4 text-center">
                    <div
                      className={cn(
                        "inline-flex flex-col items-center rounded-lg p-3",
                        currentTier === "free" && "bg-muted",
                      )}
                    >
                      <span className="text-lg font-bold">Free</span>
                      <span className="text-sm text-muted-foreground">$0</span>
                      {currentTier === "free" && (
                        <Badge variant="outline" className="mt-1">
                          Current
                        </Badge>
                      )}
                    </div>
                  </th>
                  <th className="pb-4 text-center">
                    <div
                      className={cn(
                        "inline-flex flex-col items-center rounded-lg p-3",
                        currentTier === "starter"
                          ? "bg-muted"
                          : "bg-primary/5 border border-primary/20",
                      )}
                    >
                      <span className="text-lg font-bold">Starter</span>
                      <span className="text-sm text-muted-foreground">
                        $
                        {(
                          plansConfig.starter.pricing.monthly.price / 100
                        ).toFixed(0)}
                        /mo
                      </span>
                      {currentTier === "starter" ? (
                        <Badge variant="outline" className="mt-1">
                          Current
                        </Badge>
                      ) : (
                        <Badge className="mt-1">Recommended</Badge>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {planFeatures.map((feature, index) => (
                  <tr
                    key={feature.name}
                    className={cn(
                      "border-b last:border-0",
                      index % 2 === 0 && "bg-muted/30",
                    )}
                  >
                    <td className="py-3 text-sm font-medium">{feature.name}</td>
                    <td className="py-3 text-center">
                      {typeof feature.free === "boolean" ? (
                        feature.free ? (
                          <Check className="mx-auto h-5 w-5 text-green-600" />
                        ) : (
                          <X className="mx-auto h-5 w-5 text-muted-foreground" />
                        )
                      ) : (
                        <span className="text-sm">{feature.free}</span>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      {typeof feature.starter === "boolean" ? (
                        feature.starter ? (
                          <Check className="mx-auto h-5 w-5 text-green-600" />
                        ) : (
                          <X className="mx-auto h-5 w-5 text-muted-foreground" />
                        )
                      ) : (
                        <span className="text-sm font-medium text-primary">
                          {feature.starter}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        {isFreePlan && (
          <CardFooter className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">Ready to upgrade?</p>
              <p className="text-sm text-muted-foreground">
                Get unlimited reviews and email alerts today.
              </p>
            </div>
            <div className="flex gap-3">
              <UpgradeButton>
                Upgrade to Starter - $
                {(plansConfig.starter.pricing.monthly.price / 100).toFixed(0)}
                /mo
              </UpgradeButton>
            </div>
          </CardFooter>
        )}
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
