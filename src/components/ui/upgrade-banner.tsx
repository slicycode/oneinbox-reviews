"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Sparkles, X } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "./button";

const upgradeBannerVariants = cva(
  "relative flex items-center gap-3 rounded-lg border px-4 py-3 text-sm",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 text-foreground",
        subtle: "bg-muted/50 border-border text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface UpgradeBannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof upgradeBannerVariants> {
  feature: string;
  currentPlan: string;
  message?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

function UpgradeBanner({
  className,
  variant,
  feature,
  currentPlan,
  message,
  dismissible = true,
  onDismiss,
  ...props
}: UpgradeBannerProps) {
  const [isDismissed, setIsDismissed] = React.useState(false);

  if (isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const defaultMessage = `${feature} is available on the Starter plan. You're currently on the ${currentPlan} plan.`;

  return (
    <div
      role="banner"
      className={cn(upgradeBannerVariants({ variant }), className)}
      {...props}
    >
      <Sparkles className="size-4 shrink-0 text-primary" />
      <div className="flex-1 min-w-0">
        <p className="text-sm">{message || defaultMessage}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button asChild size="sm" variant="default">
          <Link href="/app/settings/billing">Upgrade</Link>
        </Button>
        {dismissible && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleDismiss}
            aria-label="Dismiss"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export { UpgradeBanner, upgradeBannerVariants };
