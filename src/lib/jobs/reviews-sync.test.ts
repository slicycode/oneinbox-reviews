import assert from "node:assert/strict";
import test from "node:test";
import {
  buildGoogleReviewRecord,
  mapGoogleStarRating,
} from "@/lib/jobs/reviews-sync";

test("mapGoogleStarRating maps star values", () => {
  assert.equal(mapGoogleStarRating("FIVE"), 5);
  assert.equal(mapGoogleStarRating("FOUR"), 4);
  assert.equal(mapGoogleStarRating("THREE"), 3);
  assert.equal(mapGoogleStarRating("TWO"), 2);
  assert.equal(mapGoogleStarRating("ONE"), 1);
  assert.equal(mapGoogleStarRating("UNKNOWN"), null);
});

test("buildGoogleReviewRecord returns null without id or rating", () => {
  const now = new Date("2025-01-01T00:00:00.000Z");
  const missingRating = buildGoogleReviewRecord({
    userId: "user-1",
    locationName: "HQ",
    placeId: "place-1",
    review: { reviewId: "review-1" },
    now,
  });
  const missingId = buildGoogleReviewRecord({
    userId: "user-1",
    locationName: "HQ",
    placeId: "place-1",
    review: { starRating: "FIVE" },
    now,
  });

  assert.equal(missingRating, null);
  assert.equal(missingId, null);
});

test("buildGoogleReviewRecord normalizes review fields", () => {
  const now = new Date("2025-01-01T00:00:00.000Z");
  const record = buildGoogleReviewRecord({
    userId: "user-1",
    locationName: "HQ",
    placeId: "place-1",
    review: {
      reviewId: "review-1",
      starRating: "FIVE",
      comment: "Great service!",
      createTime: "2024-12-31T12:00:00.000Z",
      reviewer: { displayName: "Alex" },
    },
    now,
  });

  assert.ok(record);
  assert.equal(record?.rating, 5);
  assert.equal(record?.authorName, "Alex");
  assert.equal(record?.reviewUrl, "https://search.google.com/local/reviews?placeid=place-1");
  assert.equal(record?.locationName, "HQ");
  assert.equal(record?.reviewCreatedAt.toISOString(), "2024-12-31T12:00:00.000Z");
});
