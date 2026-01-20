"use client";

import { useRouter } from "next/navigation";
import { PricingTable } from "@/components/ui/pricing-table";
import type { PlanTier, BillingInterval } from "@/lib/plans/config";

interface PricingTableWrapperProps {
  currentTier: PlanTier;
}

export function PricingTableWrapper({ currentTier }: PricingTableWrapperProps) {
  const router = useRouter();

  const handleUpgrade = (tier: PlanTier, interval: BillingInterval) => {
    // Navigate to checkout with the selected plan and interval
    router.push(`/api/checkout?plan=${tier}&interval=${interval}`);
  };

  return (
    <PricingTable
      currentTier={currentTier}
      onUpgrade={handleUpgrade}
      showBillingToggle={true}
      highlightRecommended={true}
    />
  );
}
