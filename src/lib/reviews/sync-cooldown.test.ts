import assert from "node:assert/strict";
import test from "node:test";
import { normalizeCooldownSeconds } from "@/lib/reviews/sync-cooldown";

test("normalizeCooldownSeconds returns null for empty values", () => {
  assert.equal(normalizeCooldownSeconds(undefined), null);
  assert.equal(normalizeCooldownSeconds(null), null);
  assert.equal(normalizeCooldownSeconds(0), null);
  assert.equal(normalizeCooldownSeconds(-5), null);
});

test("normalizeCooldownSeconds returns positive values", () => {
  assert.equal(normalizeCooldownSeconds(1), 1);
  assert.equal(normalizeCooldownSeconds(120), 120);
});
