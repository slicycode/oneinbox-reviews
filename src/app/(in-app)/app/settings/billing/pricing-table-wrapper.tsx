"use client";

import * as React from "react";
import { toast } from "sonner";
import { PricingTable } from "@/components/ui/pricing-table";
import type { PlanTier, BillingInterval } from "@/lib/plans/config";

interface PricingTableWrapperProps {
  currentTier: PlanTier;
  autoCheckout?: {
    plan: PlanTier;
    interval: BillingInterval;
  };
}

export function PricingTableWrapper({
  currentTier,
  autoCheckout,
}: PricingTableWrapperProps) {
  const [hasTriggeredAutoCheckout, setHasTriggeredAutoCheckout] =
    React.useState(false);

  const handleUpgrade = React.useCallback(
    async (tier: PlanTier, interval: BillingInterval) => {
      try {
        const response = await fetch("/api/app/subscriptions/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planTier: tier,
            billingInterval: interval,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error?.message || "Failed to start checkout");
          return;
        }

        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        }
      } catch (error) {
        console.error("Checkout error:", error);
        toast.error("Something went wrong");
      }
    },
    []
  );

  // Auto-trigger checkout if billingComplete param is present
  React.useEffect(() => {
    if (autoCheckout && !hasTriggeredAutoCheckout) {
      setHasTriggeredAutoCheckout(true);
      toast.info("Continuing with your upgrade...");
      handleUpgrade(autoCheckout.plan, autoCheckout.interval);
    }
  }, [autoCheckout, hasTriggeredAutoCheckout, handleUpgrade]);

  return (
    <PricingTable
      currentTier={currentTier}
      onUpgrade={handleUpgrade}
      showBillingToggle={true}
      highlightRecommended={true}
    />
  );
}
