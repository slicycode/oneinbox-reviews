import assert from "node:assert/strict";
import test from "node:test";
import { getInboxSyncSummary } from "@/lib/reviews/sync-summary";

test("getInboxSyncSummary returns not synced for empty state", () => {
  const summary = getInboxSyncSummary({
    status: "stale",
    lastError: null,
    hasSync: false,
  });

  assert.equal(summary.label, "Not synced yet");
  assert.ok(summary.helperText?.includes("Connect Google"));
});

test("getInboxSyncSummary returns auth guidance on token errors", () => {
  const summary = getInboxSyncSummary({
    status: "failed",
    lastError: "invalid_grant: token revoked",
    hasSync: true,
  });

  assert.equal(summary.label, "Sync error");
  assert.ok(summary.helperText?.includes("Reconnect"));
});

test("getInboxSyncSummary returns default failed guidance", () => {
  const summary = getInboxSyncSummary({
    status: "failed",
    lastError: "Unexpected error",
    hasSync: true,
  });

  assert.equal(summary.label, "Sync error");
  assert.ok(summary.helperText?.includes("Sync failed"));
});

test("getInboxSyncSummary returns active without helper text", () => {
  const summary = getInboxSyncSummary({
    status: "active",
    lastError: null,
    hasSync: true,
  });

  assert.equal(summary.label, "Active");
  assert.equal(summary.helperText, null);
});
