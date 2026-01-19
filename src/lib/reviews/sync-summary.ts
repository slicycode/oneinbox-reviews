import { getGoogleSyncErrorGuidance } from "@/lib/auth/google-connection";

type InboxSyncStatus = "active" | "failed" | "stale";

type InboxSyncSummary = {
  label: string;
  helperText: string | null;
  showIntegrationsLink: boolean;
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
      showIntegrationsLink: true,
    };
  }

  if (params.status === "failed") {
    const guidance = getGoogleSyncErrorGuidance(params.lastError);
    return {
      label: "Sync error",
      helperText:
        guidance ?? "Sync failed. Try refreshing or reconnect Google.",
      showIntegrationsLink: guidance ? false : true,
    };
  }

  if (params.status === "stale") {
    return {
      label: "Sync delayed",
      helperText:
        "No recent sync yet. If you just refreshed, check back in a few minutes.",
      showIntegrationsLink: false,
    };
  }

  return { label: "Active", helperText: null, showIntegrationsLink: false };
};
