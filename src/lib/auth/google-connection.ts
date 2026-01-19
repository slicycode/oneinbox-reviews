export type GoogleConnectionStatus = "active" | "expired" | "error";
export type GoogleSyncStatus = "active" | "failed" | "stale";

export const GOOGLE_REQUIRED_SCOPES = [
  "https://www.googleapis.com/auth/business.manage",
];

type ResolveGoogleConnectionStatusArgs = {
  connectionStatus?: GoogleConnectionStatus | null;
  isExpired: boolean;
};

export function resolveGoogleConnectionStatus({
  connectionStatus,
  isExpired,
}: ResolveGoogleConnectionStatusArgs): GoogleConnectionStatus {
  if (isExpired) {
    return "expired";
  }

  return connectionStatus ?? "active";
}

type GoogleSyncSummary = {
  label: string;
  requiresAction: boolean;
};

type ResolveGoogleSyncSummaryArgs = {
  isConnected: boolean;
  syncStatus?: GoogleSyncStatus | null;
  lastSuccessAt?: Date | null;
};

export function resolveGoogleSyncSummary({
  isConnected,
  syncStatus,
  lastSuccessAt,
}: ResolveGoogleSyncSummaryArgs): GoogleSyncSummary {
  if (!isConnected) {
    return { label: "Not connected", requiresAction: true };
  }

  if (syncStatus === "failed") {
    return { label: "Sync error", requiresAction: true };
  }

  if (syncStatus === "stale") {
    return { label: "Sync delayed", requiresAction: false };
  }

  if (!lastSuccessAt) {
    return { label: "First sync pending", requiresAction: false };
  }

  return { label: "Sync active", requiresAction: false };
}

export function parseGoogleSyncStatus(
  status: string | null | undefined
): GoogleSyncStatus | null {
  if (status === "active" || status === "failed" || status === "stale") {
    return status;
  }

  return null;
}

const GOOGLE_AUTH_ERROR_HINTS = [
  "invalid_grant",
  "invalid_token",
  "token",
  "unauthorized",
  "forbidden",
  "revoked",
  "expired",
  "401",
  "403",
];

export function isGoogleAuthError(
  message: string | null | undefined
): boolean {
  if (!message) {
    return false;
  }

  const normalized = message.toLowerCase();
  return GOOGLE_AUTH_ERROR_HINTS.some((hint) => normalized.includes(hint));
}

const GOOGLE_SYNC_SERVICE_DISABLED_HINTS = [
  "service_disabled",
  "mybusinessaccountmanagement.googleapis.com",
  "mybusinessbusinessinformation.googleapis.com",
  "mybusiness.googleapis.com",
];
const GOOGLE_SYNC_RATE_LIMIT_HINTS = [
  "resource_exhausted",
  "rate_limit_exceeded",
  "quota exceeded",
  "quota_limit_value",
];

export function getGoogleSyncErrorGuidance(
  message: string | null | undefined
): string | null {
  if (!message) {
    return null;
  }

  const normalized = message.toLowerCase();
  const isServiceDisabled = GOOGLE_SYNC_SERVICE_DISABLED_HINTS.some((hint) =>
    normalized.includes(hint)
  );
  if (isServiceDisabled) {
    return "Google Business Profile API is disabled for this app. Enable it in Google Cloud, then refresh.";
  }

  const isRateLimited = GOOGLE_SYNC_RATE_LIMIT_HINTS.some((hint) =>
    normalized.includes(hint)
  );
  if (isRateLimited) {
    return "Google rate limit reached for this app. Try again later or increase the API quota.";
  }

  if (isGoogleAuthError(message)) {
    return "Google access expired. Reconnect to resume syncing.";
  }

  return null;
}

export function hasRequiredGoogleScopes(
  scope: string | null | undefined,
  requiredScopes: readonly string[] = GOOGLE_REQUIRED_SCOPES
): boolean {
  if (!scope) {
    return false;
  }

  const grantedScopes = new Set(scope.split(" ").filter(Boolean));
  return requiredScopes.every((requiredScope) =>
    grantedScopes.has(requiredScope)
  );
}

export function getGoogleOAuthErrorMessage(
  error: string | string[] | null | undefined
): string | null {
  if (!error) {
    return null;
  }

  const errorValue = Array.isArray(error) ? error[0] : error;

  switch (errorValue) {
    case "google_missing_scopes":
      return "Google connection needs additional permissions. Please approve all requested access and try again.";
    case "AccessDenied":
    case "access_denied":
      return "Google connection was cancelled or denied. Please grant access to continue.";
    case "OAuthCallback":
    case "OAuthSignin":
    case "OAuthAccountNotLinked":
    case "OAuthCreateAccount":
    case "Configuration":
      return "Google connection failed. Please try again.";
    default:
      return "Google connection failed. Please try again.";
  }
}
