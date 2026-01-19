import { isGoogleAuthError } from "@/lib/auth/google-connection";

type InboxSyncStatus = "active" | "failed" | "stale";

type InboxSyncSummary = {
  label: string;
  helperText: string | null;
};

export const getInboxSyncSummary = (params: {
  status: InboxSyncStatus;
  lastError?: string | null;
  hasSync: boolean;
}): InboxSyncSummary => {
  if (!params.hasSync) {
    return {
      label: "Not synced yet",
      helperText: "Connect Google to start syncing reviews.",
    };
  }

  if (params.status === "failed") {
    return {
      label: "Sync error",
      helperText: isGoogleAuthError(params.lastError)
        ? "Google access expired. Reconnect to resume syncing."
        : "Sync failed. Try refreshing or reconnect Google.",
    };
  }

  if (params.status === "stale") {
    return {
      label: "Sync delayed",
      helperText: "No recent sync yet. Try refreshing in a few minutes.",
    };
  }

  return { label: "Active", helperText: null };
};
