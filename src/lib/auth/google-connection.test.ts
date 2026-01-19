import assert from "node:assert/strict";
import test from "node:test";
import {
  getGoogleOAuthErrorMessage,
  hasRequiredGoogleScopes,
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
