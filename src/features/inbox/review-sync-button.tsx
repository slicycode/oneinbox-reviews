"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCcwIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizeCooldownSeconds } from "../../lib/reviews/sync-cooldown";

export function ReviewSyncButton({
  initialCooldownSeconds = null,
}: {
  initialCooldownSeconds?: number | null;
}) {
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [cooldownRemaining, setCooldownRemaining] = React.useState<number | null>(
    () => normalizeCooldownSeconds(initialCooldownSeconds)
  );
  const router = useRouter();

  const formatCooldown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    const paddedSeconds = remaining.toString().padStart(2, "0");
    return minutes > 0 ? `${minutes}m ${paddedSeconds}s` : `${remaining}s`;
  };

  React.useEffect(() => {
    setCooldownRemaining(normalizeCooldownSeconds(initialCooldownSeconds));
  }, [initialCooldownSeconds]);

  React.useEffect(() => {
    if (!cooldownRemaining) {
      return;
    }

    const timer = window.setInterval(() => {
      setCooldownRemaining((current) => {
        if (!current || current <= 1) {
          window.clearInterval(timer);
          return null;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownRemaining]);

  const handleSync = async () => {
    if (isSyncing || cooldownRemaining) {
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch("/api/app/reviews-sync", { method: "POST" });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message =
          errorData?.error?.message ||
          errorData?.error ||
          "Failed to sync reviews";
        const retryAfterSeconds = errorData?.error?.retryAfterSeconds;
        if (
          errorData?.error?.code === "review_sync_rate_limited" &&
          typeof retryAfterSeconds === "number"
        ) {
          setCooldownRemaining(retryAfterSeconds);
        }
        throw new Error(message);
      }

      const result = await response.json().catch(() => null);
      const insertedCount = result?.inserted;
      if (typeof insertedCount === "number" && insertedCount === 0) {
        toast.message("No new reviews found");
      } else {
        toast.success("Reviews refreshed");
      }
      router.refresh();
    } catch (error) {
      console.error("Review sync error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to sync reviews"
      );
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      variant="secondary"
      className="w-fit"
      onClick={handleSync}
      disabled={isSyncing || Boolean(cooldownRemaining)}
    >
      <RefreshCcwIcon className={cn("size-4", isSyncing && "animate-spin")} />
      {cooldownRemaining
        ? `Refresh in ${formatCooldown(cooldownRemaining)}`
        : "Refresh Reviews"}
    </Button>
  );
}
