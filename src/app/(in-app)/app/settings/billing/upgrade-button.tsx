"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { UpgradeModal } from "@/components/ui/upgrade-modal";
import { type BillingInterval } from "@/lib/plans/config";

interface UpgradeButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  defaultInterval?: BillingInterval;
}

export function UpgradeButton({
  children,
  className,
  variant = "default",
  size = "default",
  defaultInterval = "monthly",
}: UpgradeButtonProps) {
  return (
    <UpgradeModal
      defaultInterval={defaultInterval}
      trigger={
        <Button variant={variant} size={size} className={className}>
          {children}
        </Button>
      }
    />
  );
}
