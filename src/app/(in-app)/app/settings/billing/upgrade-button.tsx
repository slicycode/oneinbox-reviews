"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface UpgradeButtonProps {
  children: React.ReactNode;
  className?: string;
}

export function UpgradeButton({ children, className }: UpgradeButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/app/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planTier: "starter",
          billingInterval: "monthly",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.code === "BILLING_PROFILE_REQUIRED") {
          toast.error("Please complete your billing profile first");
          router.push("/app/billing/profile");
          return;
        }
        toast.error(data.error?.message || "Failed to start checkout");
        return;
      }

      // Redirect to Dodo checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleUpgrade} disabled={isLoading} className={className}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </Button>
  );
}
