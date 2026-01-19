export type GoogleConnectionStatus = "active" | "expired" | "error";

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
