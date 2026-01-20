"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Crown, AlertTriangle, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscription, type SubscriptionInfo } from "@/lib/subscriptions/useSubscription";

interface PlanBadgeProps {
  className?: string;
  showUpgradeLink?: boolean;
  variant?: "default" | "compact";
}

function getBadgeConfig(subscription: SubscriptionInfo) {
  const { planTier, isTrial, isPastDue, isCanceling, trialDaysRemaining, daysUntilExpiry } = subscription;

  // Past due - needs attention
  if (isPastDue) {
    return {
      label: "Past Due",
      variant: "destructive" as const,
      icon: AlertTriangle,
      tooltip: "Your payment is past due. Please update your payment method.",
      showWarning: true,
    };
  }

  // Canceling - will expire soon
  if (isCanceling && daysUntilExpiry !== null) {
    return {
      label: `Cancels in ${daysUntilExpiry}d`,
      variant: "secondary" as const,
      icon: Clock,
      tooltip: `Your subscription will cancel on ${subscription.currentPeriodEnd?.toLocaleDateString()}`,
      showWarning: true,
    };
  }

  // Trial period
  if (isTrial && trialDaysRemaining !== null) {
    return {
      label: `Trial: ${trialDaysRemaining}d left`,
      variant: "outline" as const,
      icon: Clock,
      tooltip: `Your trial ends in ${trialDaysRemaining} days`,
      showWarning: trialDaysRemaining <= 3,
    };
  }

  // Starter plan (paid)
  if (planTier === "starter") {
    return {
      label: "Starter",
      variant: "default" as const,
      icon: Crown,
      tooltip: "You're on the Starter plan with unlimited reviews",
      showWarning: false,
    };
  }

  // Free plan
  return {
    label: "Free",
    variant: "secondary" as const,
    icon: Zap,
    tooltip: "Upgrade to Starter for unlimited reviews and more features",
    showWarning: false,
  };
}

export function PlanBadge({ className, showUpgradeLink = true, variant = "default" }: PlanBadgeProps) {
  const { subscription, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <Badge variant="outline" className={cn("animate-pulse", className)}>
        <span className="opacity-0">Loading</span>
      </Badge>
    );
  }

  if (!subscription) {
    return null;
  }

  const config = getBadgeConfig(subscription);
  const Icon = config.icon;
  const isFreePlan = subscription.planTier === "free";
  const shouldLink = showUpgradeLink && (isFreePlan || config.showWarning);

  const badgeContent = (
    <Badge
      variant={config.variant}
      className={cn(
        "gap-1 cursor-default transition-colors",
        shouldLink && "cursor-pointer hover:opacity-80",
        config.showWarning && config.variant !== "destructive" && "border-amber-500 text-amber-600",
        variant === "compact" && "text-xs px-1.5 py-0",
        className
      )}
    >
      <Icon className={cn("h-3 w-3", variant === "compact" && "h-2.5 w-2.5")} />
      {config.label}
    </Badge>
  );

  const wrappedBadge = shouldLink ? (
    <Link href="/app/settings/billing">{badgeContent}</Link>
  ) : (
    badgeContent
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{wrappedBadge}</TooltipTrigger>
        <TooltipContent>
          <p>{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Inline subscription status for use in settings/profile pages
 */
export function SubscriptionStatus({ className }: { className?: string }) {
  const { subscription, isLoading } = useSubscription();

  if (isLoading) {
    return <div className={cn("h-5 w-24 animate-pulse bg-muted rounded", className)} />;
  }

  if (!subscription) {
    return null;
  }

  const config = getBadgeConfig(subscription);

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <PlanBadge showUpgradeLink={false} />
      {config.showWarning && (
        <span className="text-amber-600 text-xs">{config.tooltip}</span>
      )}
    </div>
  );
}

/**
 * Trial banner for showing at the top of pages
 */
export function TrialBanner({ className }: { className?: string }) {
  const { subscription, isLoading } = useSubscription();

  if (isLoading || !subscription) {
    return null;
  }

  const { isTrial, trialDaysRemaining, isPastDue, isCanceling, daysUntilExpiry } = subscription;

  // Show banner for trial, past due, or canceling
  if (!isTrial && !isPastDue && !isCanceling) {
    return null;
  }

  let message = "";
  let variant: "warning" | "error" = "warning";

  if (isPastDue) {
    message = "Your payment is past due. Please update your payment method to continue using all features.";
    variant = "error";
  } else if (isCanceling && daysUntilExpiry !== null) {
    message = `Your subscription will cancel in ${daysUntilExpiry} days. You'll be downgraded to the Free plan.`;
  } else if (isTrial && trialDaysRemaining !== null) {
    message = `You have ${trialDaysRemaining} days left in your trial. Upgrade now to keep all features.`;
  }

  if (!message) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-lg px-4 py-2 text-sm",
        variant === "error"
          ? "bg-destructive/10 text-destructive border border-destructive/20"
          : "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>{message}</span>
      </div>
      <Link
        href="/app/settings/billing"
        className="shrink-0 font-medium underline hover:no-underline"
      >
        {isPastDue ? "Update payment" : "View plans"}
      </Link>
    </div>
  );
}
