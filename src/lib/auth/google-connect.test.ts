import assert from "node:assert/strict";
import test from "node:test";
import { getGoogleConnectOptions } from "@/lib/auth/google-connect";

test("getGoogleConnectOptions returns provider and callbackUrl", () => {
  const options = getGoogleConnectOptions();

  assert.equal(options.provider, "google");
  assert.equal(options.callbackUrl, "/app/integrations");
});
