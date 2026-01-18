import assert from "node:assert/strict";
import test from "node:test";
import { canDisconnectGoogle } from "@/lib/auth/google-disconnect";

test("canDisconnectGoogle blocks when Google is the only provider", () => {
  assert.equal(
    canDisconnectGoogle({ hasPassword: false, providers: ["google"] }),
    false
  );
});

test("canDisconnectGoogle allows when a password is set", () => {
  assert.equal(
    canDisconnectGoogle({ hasPassword: true, providers: ["google"] }),
    true
  );
});

test("canDisconnectGoogle allows when another provider is linked", () => {
  assert.equal(
    canDisconnectGoogle({ hasPassword: false, providers: ["google", "email"] }),
    true
  );
});
