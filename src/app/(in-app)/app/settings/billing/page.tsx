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
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { getPlanConfig, plansConfig, type PlanTier } from "@/lib/plans/config";
import { isActiveSubscription, getStatusLabel } from "@/lib/subscriptions/state-machine";
import { BillingActions } from "./billing-actions";

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
    ? (subscriptionRow?.planTier as PlanTier) ?? "free"
    : "free";

  const planConfig = getPlanConfig(currentTier);
  const statusLabel = subscriptionRow
    ? getStatusLabel(subscriptionRow.status)
    : "No subscription";

  // Calculate usage percentage
  const maxReviews = planConfig.limits.maxReviews;
  const usagePercent = maxReviews
    ? Math.min(100, Math.round((reviewCount / maxReviews) * 100))
    : 0;

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

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Plan Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Current Plan
              <Badge variant={hasActiveSubscription ? "default" : "secondary"}>
                {statusLabel}
              </Badge>
            </CardTitle>
            <CardDescription>{planConfig.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{planConfig.name}</span>
              {planConfig.pricing.monthly.price > 0 && (
                <span className="text-muted-foreground">
                  ${(planConfig.pricing.monthly.price / 100).toFixed(0)}/mo
                </span>
              )}
            </div>

            {subscriptionRow?.currentPeriodEnd && hasActiveSubscription && (
              <p className="text-sm text-muted-foreground">
                {subscriptionRow.cancelAtPeriodEnd
                  ? "Cancels on "
                  : "Renews on "}
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

            <div className="space-y-2">
              <p className="text-sm font-medium">Features included:</p>
              <ul className="space-y-1">
                {planConfig.features.length > 0 ? (
                  planConfig.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="size-4 text-primary" />
                      {feature.replace(/_/g, " ")}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-muted-foreground">
                    Basic features only
                  </li>
                )}
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <BillingActions
              hasActiveSubscription={hasActiveSubscription}
              cancelAtPeriodEnd={subscriptionRow?.cancelAtPeriodEnd ?? false}
              currentTier={currentTier}
            />
          </CardFooter>
        </Card>

        {/* Usage Card */}
        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <CardDescription>
              Your current resource usage this billing period.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Reviews</span>
                <span className="text-muted-foreground">
                  {reviewCount} / {maxReviews ?? "Unlimited"}
                </span>
              </div>
              {maxReviews && (
                <Progress value={usagePercent} className="h-2" />
              )}
              {!maxReviews && (
                <p className="text-xs text-muted-foreground">
                  Unlimited reviews on your plan
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Google Accounts</span>
                <span className="text-muted-foreground">
                  {planConfig.limits.maxGoogleAccounts} allowed
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Email Alerts</span>
                <Badge variant={planConfig.limits.emailAlertsEnabled ? "default" : "secondary"}>
                  {planConfig.limits.emailAlertsEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Data Retention</span>
                <span className="text-muted-foreground">
                  {planConfig.limits.retentionDays} days
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade CTA for free users */}
      {currentTier === "free" && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              Upgrade to Starter
            </CardTitle>
            <CardDescription>
              Get unlimited reviews, email alerts, and more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {plansConfig.starter.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="size-4 text-primary" />
                  {feature.replace(/_/g, " ")}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex gap-4">
            <Button asChild>
              <Link href="/app/subscribe">
                Upgrade for ${(plansConfig.starter.pricing.monthly.price / 100).toFixed(0)}/mo
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/app/billing/profile">Update Billing Info</Link>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
