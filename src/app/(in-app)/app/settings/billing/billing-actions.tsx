"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import type { PlanTier } from "@/lib/plans/config";

interface BillingActionsProps {
  hasActiveSubscription: boolean;
  cancelAtPeriodEnd: boolean;
  currentTier: PlanTier;
}

export function BillingActions({
  hasActiveSubscription,
  cancelAtPeriodEnd,
  currentTier,
}: BillingActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/app/subscriptions/cancel", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to cancel subscription");
        return;
      }

      toast.success("Subscription will be canceled at the end of the billing period");
      router.refresh();
    } catch (error) {
      console.error("Cancel error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResume = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/app/subscriptions/resume", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to resume subscription");
        return;
      }

      toast.success("Subscription has been resumed");
      router.refresh();
    } catch (error) {
      console.error("Resume error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Free user - show upgrade button
  if (currentTier === "free" || !hasActiveSubscription) {
    return (
      <Button asChild>
        <Link href="/app/subscribe">Upgrade to Starter</Link>
      </Button>
    );
  }

  // Subscription pending cancellation - show resume button
  if (cancelAtPeriodEnd) {
    return (
      <Button onClick={handleResume} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Resuming...
          </>
        ) : (
          "Resume Subscription"
        )}
      </Button>
    );
  }

  // Active subscription - show cancel button
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" disabled={isLoading}>
          Cancel Subscription
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
          <AlertDialogDescription>
            Your subscription will remain active until the end of your current
            billing period. You can resume anytime before then.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Canceling...
              </>
            ) : (
              "Yes, Cancel"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
