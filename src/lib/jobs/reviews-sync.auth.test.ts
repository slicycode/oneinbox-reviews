import assert from "node:assert/strict";
import test from "node:test";
import { isGoogleTokenExpired } from "@/lib/jobs/reviews-sync";

test("isGoogleTokenExpired returns true for missing expiry", () => {
  assert.equal(isGoogleTokenExpired(undefined), true);
  assert.equal(isGoogleTokenExpired(null), true);
});

test("isGoogleTokenExpired respects expiry with buffer", () => {
  const nowSeconds = Math.floor(Date.now() / 1000);
  assert.equal(isGoogleTokenExpired(nowSeconds + 3600), false);
  assert.equal(isGoogleTokenExpired(nowSeconds + 30), true);
});
