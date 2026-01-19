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
    return { label: "Sync delayed", requiresAction: true };
  }

  if (!lastSuccessAt) {
    return { label: "Sync pending", requiresAction: false };
  }

  return { label: "Syncing", requiresAction: false };
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
