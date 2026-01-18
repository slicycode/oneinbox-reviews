"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCcwIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ReviewSyncButton() {
  const [isSyncing, setIsSyncing] = React.useState(false);
  const router = useRouter();

  const handleSync = async () => {
    if (isSyncing) {
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
      disabled={isSyncing}
    >
      <RefreshCcwIcon className={cn("size-4", isSyncing && "animate-spin")} />
      {isSyncing ? "Refresh Reviews" : "Refresh Reviews"}
    </Button>
  );
}
