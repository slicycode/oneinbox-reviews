import assert from "node:assert/strict";
import test from "node:test";
import { getAppEntryContent } from "@/lib/app-entry";

test("getAppEntryContent returns CTA and guidance copy", () => {
  const content = getAppEntryContent();

  assert.equal(content.ctaLabel, "Connect Google");
  assert.ok(content.description.includes("Google reviews"));
  assert.ok(content.helper.includes("Google Business Profile"));
});
