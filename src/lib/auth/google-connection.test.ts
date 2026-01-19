import assert from "node:assert/strict";
import test from "node:test";
import {
  getGoogleOAuthErrorMessage,
  getGoogleSyncErrorGuidance,
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
    { label: "First sync pending", requiresAction: false }
  );
});

test("resolveGoogleSyncSummary does not require action when stale", () => {
  assert.deepEqual(
    resolveGoogleSyncSummary({
      isConnected: true,
      syncStatus: "stale",
      lastSuccessAt: new Date(),
    }),
    { label: "Sync delayed", requiresAction: false }
  );
});

test("resolveGoogleSyncSummary returns active when synced", () => {
  assert.deepEqual(
    resolveGoogleSyncSummary({
      isConnected: true,
      syncStatus: "active",
      lastSuccessAt: new Date(),
    }),
    { label: "Sync active", requiresAction: false }
  );
});

test("parseGoogleSyncStatus returns null for unknown status", () => {
  assert.equal(parseGoogleSyncStatus("unknown"), null);
});

test("isGoogleAuthError returns true for revoked tokens", () => {
  assert.equal(isGoogleAuthError("invalid_grant: token revoked"), true);
});

test("getGoogleSyncErrorGuidance returns guidance for disabled API", () => {
  assert.equal(
    getGoogleSyncErrorGuidance(
      "My Business Account Management API has not been used in project 123 before or it is disabled. SERVICE_DISABLED"
    ),
    "Google Business Profile API is disabled for this app. Enable it in Google Cloud, then refresh."
  );
});

test("getGoogleSyncErrorGuidance returns guidance for rate limits", () => {
  assert.equal(
    getGoogleSyncErrorGuidance(
      "Quota exceeded for quota metric 'Requests' RESOURCE_EXHAUSTED RATE_LIMIT_EXCEEDED"
    ),
    "Google rate limit reached for this app. Try again later or increase the API quota."
  );
});
