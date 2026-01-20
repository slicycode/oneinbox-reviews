"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  plansConfig,
  type PlanTier,
  type BillingInterval,
} from "@/lib/plans/config";

// Feature comparison data with typed values
interface PlanFeature {
  name: string;
  description?: string;
  free: string | boolean;
  starter: string | boolean;
}

const planFeatures: PlanFeature[] = [
  {
    name: "Reviews",
    description: "Number of reviews you can manage",
    free: "50 reviews",
    starter: "Unlimited",
  },
  {
    name: "Data retention",
    description: "How long your review history is kept",
    free: "30 days",
    starter: "365 days",
  },
  {
    name: "Google accounts",
    description: "Connected business profiles",
    free: "1 account",
    starter: "1 account",
  },
  {
    name: "Email alerts",
    description: "Get notified about negative reviews",
    free: false,
    starter: true,
  },
  {
    name: "Advanced filters",
    description: "Filter by status, date, and more",
    free: false,
    starter: true,
  },
  {
    name: "CSV export",
    description: "Export your reviews to spreadsheets",
    free: true,
    starter: true,
  },
  {
    name: "Review response drafts",
    description: "AI-assisted response suggestions",
    free: true,
    starter: true,
  },
];

interface PricingTableProps {
  currentTier?: PlanTier;
  onUpgrade?: (tier: PlanTier, interval: BillingInterval) => void;
  showBillingToggle?: boolean;
  defaultInterval?: BillingInterval;
  highlightRecommended?: boolean;
  compact?: boolean;
  className?: string;
}

function formatPrice(priceInCents: number): string {
  return `$${(priceInCents / 100).toFixed(0)}`;
}

function calculateYearlySavings(): number {
  const monthlyTotal = plansConfig.starter.pricing.monthly.price * 12;
  const yearlyTotal = plansConfig.starter.pricing.yearly.price;
  return Math.round(((monthlyTotal - yearlyTotal) / monthlyTotal) * 100);
}

export function PricingTable({
  currentTier,
  onUpgrade,
  showBillingToggle = true,
  defaultInterval = "monthly",
  highlightRecommended = true,
  compact = false,
  className,
}: PricingTableProps) {
  const [billingInterval, setBillingInterval] =
    React.useState<BillingInterval>(defaultInterval);

  const yearlySavings = calculateYearlySavings();

  const getPrice = (tier: PlanTier) => {
    const config = plansConfig[tier];
    return config.pricing[billingInterval].price;
  };

  const handleUpgradeClick = (tier: PlanTier) => {
    if (onUpgrade) {
      onUpgrade(tier, billingInterval);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Billing Toggle */}
      {showBillingToggle && (
        <div className="flex items-center justify-center gap-4">
          <Label
            htmlFor="billing-toggle"
            className={cn(
              "text-sm",
              billingInterval === "monthly"
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            checked={billingInterval === "yearly"}
            onCheckedChange={(checked) =>
              setBillingInterval(checked ? "yearly" : "monthly")
            }
          />
          <div className="flex items-center gap-2">
            <Label
              htmlFor="billing-toggle"
              className={cn(
                "text-sm",
                billingInterval === "yearly"
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              Yearly
            </Label>
            {yearlySavings > 0 && (
              <Badge variant="secondary" className="text-xs">
                Save {yearlySavings}%
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Pricing Cards for Mobile / Compact View */}
      {compact ? (
        <div className="grid gap-4 md:grid-cols-2">
          {(["free", "starter"] as PlanTier[]).map((tier) => {
            const config = plansConfig[tier];
            const price = getPrice(tier);
            const isCurrent = currentTier === tier;
            const isRecommended =
              highlightRecommended && tier === "starter" && !isCurrent;

            return (
              <div
                key={tier}
                className={cn(
                  "flex flex-col gap-4 rounded-lg border p-6",
                  isCurrent && "bg-muted",
                  isRecommended && "border-primary ring-1 ring-primary"
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">{config.name}</h3>
                  {isCurrent && <Badge variant="outline">Current</Badge>}
                  {isRecommended && <Badge>Recommended</Badge>}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">
                    {formatPrice(price)}
                  </span>
                  {price > 0 && (
                    <span className="text-muted-foreground">
                      /{billingInterval === "yearly" ? "year" : "month"}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {config.description}
                </p>
                {onUpgrade && tier !== "free" && !isCurrent && (
                  <Button onClick={() => handleUpgradeClick(tier)}>
                    Upgrade to {config.name}
                  </Button>
                )}
                {isCurrent && (
                  <Button variant="outline" disabled>
                    Current Plan
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Feature Comparison Table */
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="pb-4 text-left font-medium">Feature</th>
                {(["free", "starter"] as PlanTier[]).map((tier) => {
                  const config = plansConfig[tier];
                  const price = getPrice(tier);
                  const isCurrent = currentTier === tier;
                  const isRecommended =
                    highlightRecommended && tier === "starter" && !isCurrent;

                  return (
                    <th key={tier} className="pb-4 text-center">
                      <div
                        className={cn(
                          "inline-flex flex-col items-center rounded-lg p-3",
                          isCurrent && "bg-muted",
                          isRecommended && "bg-primary/5 border border-primary/20"
                        )}
                      >
                        <span className="text-lg font-bold">{config.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatPrice(price)}
                          {price > 0 &&
                            `/${billingInterval === "yearly" ? "yr" : "mo"}`}
                        </span>
                        {billingInterval === "yearly" && price > 0 && (
                          <span className="text-xs text-muted-foreground">
                            (
                            {formatPrice(
                              Math.round(
                                plansConfig[tier].pricing.yearly.price / 12
                              )
                            )}
                            /mo)
                          </span>
                        )}
                        {isCurrent && (
                          <Badge variant="outline" className="mt-1">
                            Current
                          </Badge>
                        )}
                        {isRecommended && <Badge className="mt-1">Recommended</Badge>}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {planFeatures.map((feature, index) => (
                <tr
                  key={feature.name}
                  className={cn(
                    "border-b last:border-0",
                    index % 2 === 0 && "bg-muted/30"
                  )}
                >
                  <td className="py-3">
                    <span className="text-sm font-medium">{feature.name}</span>
                    {feature.description && (
                      <p className="text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    )}
                  </td>
                  <td className="py-3 text-center">
                    <FeatureValue value={feature.free} />
                  </td>
                  <td className="py-3 text-center">
                    <FeatureValue value={feature.starter} highlight />
                  </td>
                </tr>
              ))}
            </tbody>
            {onUpgrade && (
              <tfoot>
                <tr>
                  <td className="pt-4" />
                  <td className="pt-4 text-center">
                    {currentTier === "free" ? (
                      <Badge variant="outline">Current Plan</Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Free forever
                      </span>
                    )}
                  </td>
                  <td className="pt-4 text-center">
                    {currentTier === "starter" ? (
                      <Badge variant="outline">Current Plan</Badge>
                    ) : (
                      <Button
                        onClick={() => handleUpgradeClick("starter")}
                        className="w-full max-w-[200px]"
                      >
                        Upgrade to Starter
                      </Button>
                    )}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}

function FeatureValue({
  value,
  highlight,
}: {
  value: string | boolean;
  highlight?: boolean;
}) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="mx-auto h-5 w-5 text-green-600" />
    ) : (
      <X className="mx-auto h-5 w-5 text-muted-foreground" />
    );
  }

  return (
    <span
      className={cn("text-sm", highlight && "font-medium text-primary")}
    >
      {value}
    </span>
  );
}
