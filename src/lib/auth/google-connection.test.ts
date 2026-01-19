import assert from "node:assert/strict";
import test from "node:test";
import {
  getGoogleOAuthErrorMessage,
  hasRequiredGoogleScopes,
  isGoogleAuthError,
  parseGoogleSyncStatus,
  resolveGoogleSyncSummary,
  resolveGoogleConnectionStatus,
} from "@/lib/auth/google-connection";

test("resolveGoogleConnectionStatus returns expired when isExpired", () => {
  assert.equal(
    resolveGoogleConnectionStatus({ connectionStatus: "active", isExpired: true }),
    "expired"
  );
});

test("resolveGoogleConnectionStatus defaults to active", () => {
  assert.equal(
    resolveGoogleConnectionStatus({ connectionStatus: null, isExpired: false }),
    "active"
  );
});

test("resolveGoogleConnectionStatus keeps error when not expired", () => {
  assert.equal(
    resolveGoogleConnectionStatus({ connectionStatus: "error", isExpired: false }),
    "error"
  );
});

test("hasRequiredGoogleScopes returns true when required scope exists", () => {
  assert.equal(
    hasRequiredGoogleScopes(
      "openid email profile https://www.googleapis.com/auth/business.manage"
    ),
    true
  );
});

test("hasRequiredGoogleScopes returns false when required scope missing", () => {
  assert.equal(
    hasRequiredGoogleScopes("openid email profile"),
    false
  );
});

test("getGoogleOAuthErrorMessage returns message for denied access", () => {
  assert.equal(
    getGoogleOAuthErrorMessage("AccessDenied"),
    "Google connection was cancelled or denied. Please grant access to continue."
  );
});

test("getGoogleOAuthErrorMessage returns message for missing scopes", () => {
  assert.equal(
    getGoogleOAuthErrorMessage("google_missing_scopes"),
    "Google connection needs additional permissions. Please approve all requested access and try again."
  );
});

test("resolveGoogleSyncSummary returns error when failed", () => {
  assert.deepEqual(
    resolveGoogleSyncSummary({
      isConnected: true,
      syncStatus: "failed",
      lastSuccessAt: new Date(),
    }),
    { label: "Sync error", requiresAction: true }
  );
});

test("resolveGoogleSyncSummary returns pending when no success yet", () => {
  assert.deepEqual(
    resolveGoogleSyncSummary({
      isConnected: true,
      syncStatus: "active",
      lastSuccessAt: null,
    }),
    { label: "Sync pending", requiresAction: false }
  );
});

test("parseGoogleSyncStatus returns null for unknown status", () => {
  assert.equal(parseGoogleSyncStatus("unknown"), null);
});

test("isGoogleAuthError returns true for revoked tokens", () => {
  assert.equal(isGoogleAuthError("invalid_grant: token revoked"), true);
});
