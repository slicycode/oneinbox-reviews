import assert from "node:assert/strict";
import test from "node:test";
import { getSyncResetUpdate } from "@/lib/reviews/sync-reset";

test("getSyncResetUpdate clears errors and sets stale status", () => {
  const now = new Date("2025-01-01T00:00:00.000Z");
  const update = getSyncResetUpdate(now);

  assert.equal(update.status, "stale");
  assert.equal(update.lastError, null);
  assert.equal(update.updatedAt, now);
});
