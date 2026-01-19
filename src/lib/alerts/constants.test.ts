import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_NEGATIVE_REVIEW_THRESHOLD } from "@/lib/alerts/constants";

test("DEFAULT_NEGATIVE_REVIEW_THRESHOLD is 5 to include all reviews", () => {
  assert.equal(DEFAULT_NEGATIVE_REVIEW_THRESHOLD, 5);
});
