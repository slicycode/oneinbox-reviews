import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  canCancel,
  canResume,
  canTransition,
  getStatusAfterPayment,
  getStatusAfterPaymentFailure,
  getStatusLabel,
  getValidTransitions,
  isActiveSubscription,
  shouldPromptUpgrade,
  subscriptionStatusSchema,
} from "@/lib/subscriptions/state-machine";
import type { SubscriptionStatus } from "@/db/schema/subscriptions";

describe("subscriptionStatusSchema", () => {
  test("validates all valid status values", () => {
    const validStatuses: SubscriptionStatus[] = [
      "none",
      "trialing",
      "active",
      "past_due",
      "canceled",
      "paused",
    ];

    for (const status of validStatuses) {
      const result = subscriptionStatusSchema.safeParse(status);
      assert.equal(result.success, true, `Expected ${status} to be valid`);
    }
  });

  test("rejects invalid status values", () => {
    const invalidStatuses = ["invalid", "pending", "expired", "", 123, null];

    for (const status of invalidStatuses) {
      const result = subscriptionStatusSchema.safeParse(status);
      assert.equal(result.success, false, `Expected ${status} to be rejected`);
    }
  });
});

describe("canTransition", () => {
  test("same state transitions are always valid", () => {
    const statuses: SubscriptionStatus[] = [
      "none",
      "trialing",
      "active",
      "past_due",
      "canceled",
      "paused",
    ];

    for (const status of statuses) {
      assert.equal(
        canTransition(status, status),
        true,
        `Expected ${status} -> ${status} to be valid`,
      );
    }
  });

  describe("from none", () => {
    test("can transition to trialing (start trial)", () => {
      assert.equal(canTransition("none", "trialing"), true);
    });

    test("can transition to active (direct subscribe)", () => {
      assert.equal(canTransition("none", "active"), true);
    });

    test("cannot transition to past_due", () => {
      assert.equal(canTransition("none", "past_due"), false);
    });

    test("cannot transition to canceled", () => {
      assert.equal(canTransition("none", "canceled"), false);
    });

    test("cannot transition to paused", () => {
      assert.equal(canTransition("none", "paused"), false);
    });
  });

  describe("from trialing", () => {
    test("can transition to active (trial converts)", () => {
      assert.equal(canTransition("trialing", "active"), true);
    });

    test("can transition to canceled (cancel during trial)", () => {
      assert.equal(canTransition("trialing", "canceled"), true);
    });

    test("can transition to none (trial ends without conversion)", () => {
      assert.equal(canTransition("trialing", "none"), true);
    });

    test("cannot transition to past_due", () => {
      assert.equal(canTransition("trialing", "past_due"), false);
    });

    test("cannot transition to paused", () => {
      assert.equal(canTransition("trialing", "paused"), false);
    });
  });

  describe("from active", () => {
    test("can transition to canceled (user cancels)", () => {
      assert.equal(canTransition("active", "canceled"), true);
    });

    test("can transition to past_due (payment failed)", () => {
      assert.equal(canTransition("active", "past_due"), true);
    });

    test("can transition to paused (pause subscription)", () => {
      assert.equal(canTransition("active", "paused"), true);
    });

    test("cannot transition to trialing", () => {
      assert.equal(canTransition("active", "trialing"), false);
    });

    test("cannot transition to none", () => {
      assert.equal(canTransition("active", "none"), false);
    });
  });

  describe("from past_due", () => {
    test("can transition to active (payment recovered)", () => {
      assert.equal(canTransition("past_due", "active"), true);
    });

    test("can transition to canceled (payment failed permanently)", () => {
      assert.equal(canTransition("past_due", "canceled"), true);
    });

    test("cannot transition to trialing", () => {
      assert.equal(canTransition("past_due", "trialing"), false);
    });

    test("cannot transition to none", () => {
      assert.equal(canTransition("past_due", "none"), false);
    });

    test("cannot transition to paused", () => {
      assert.equal(canTransition("past_due", "paused"), false);
    });
  });

  describe("from canceled", () => {
    test("can transition to active (resubscribe)", () => {
      assert.equal(canTransition("canceled", "active"), true);
    });

    test("can transition to trialing (new trial after cancel)", () => {
      assert.equal(canTransition("canceled", "trialing"), true);
    });

    test("can transition to none (cleanup)", () => {
      assert.equal(canTransition("canceled", "none"), true);
    });

    test("cannot transition to past_due", () => {
      assert.equal(canTransition("canceled", "past_due"), false);
    });

    test("cannot transition to paused", () => {
      assert.equal(canTransition("canceled", "paused"), false);
    });
  });

  describe("from paused", () => {
    test("can transition to active (resume)", () => {
      assert.equal(canTransition("paused", "active"), true);
    });

    test("can transition to canceled (cancel while paused)", () => {
      assert.equal(canTransition("paused", "canceled"), true);
    });

    test("cannot transition to trialing", () => {
      assert.equal(canTransition("paused", "trialing"), false);
    });

    test("cannot transition to none", () => {
      assert.equal(canTransition("paused", "none"), false);
    });

    test("cannot transition to past_due", () => {
      assert.equal(canTransition("paused", "past_due"), false);
    });
  });
});

describe("getValidTransitions", () => {
  test("returns valid transitions from none", () => {
    const transitions = getValidTransitions("none");
    assert.deepEqual(transitions.sort(), ["active", "trialing"].sort());
  });

  test("returns valid transitions from trialing", () => {
    const transitions = getValidTransitions("trialing");
    assert.deepEqual(transitions.sort(), ["active", "canceled", "none"].sort());
  });

  test("returns valid transitions from active", () => {
    const transitions = getValidTransitions("active");
    assert.deepEqual(
      transitions.sort(),
      ["canceled", "past_due", "paused"].sort(),
    );
  });

  test("returns valid transitions from past_due", () => {
    const transitions = getValidTransitions("past_due");
    assert.deepEqual(transitions.sort(), ["active", "canceled"].sort());
  });

  test("returns valid transitions from canceled", () => {
    const transitions = getValidTransitions("canceled");
    assert.deepEqual(transitions.sort(), ["active", "none", "trialing"].sort());
  });

  test("returns valid transitions from paused", () => {
    const transitions = getValidTransitions("paused");
    assert.deepEqual(transitions.sort(), ["active", "canceled"].sort());
  });
});

describe("isActiveSubscription", () => {
  test("returns true for active status", () => {
    assert.equal(isActiveSubscription("active"), true);
  });

  test("returns true for trialing status (trial users have access)", () => {
    assert.equal(isActiveSubscription("trialing"), true);
  });

  test("returns true for past_due status (grace period access)", () => {
    assert.equal(isActiveSubscription("past_due"), true);
  });

  test("returns false for none status", () => {
    assert.equal(isActiveSubscription("none"), false);
  });

  test("returns false for canceled status", () => {
    assert.equal(isActiveSubscription("canceled"), false);
  });

  test("returns false for paused status", () => {
    assert.equal(isActiveSubscription("paused"), false);
  });
});

describe("canCancel", () => {
  test("returns true for active subscriptions", () => {
    assert.equal(canCancel("active"), true);
  });

  test("returns true for trialing subscriptions", () => {
    assert.equal(canCancel("trialing"), true);
  });

  test("returns true for past_due subscriptions", () => {
    assert.equal(canCancel("past_due"), true);
  });

  test("returns true for paused subscriptions", () => {
    assert.equal(canCancel("paused"), true);
  });

  test("returns false for none status (nothing to cancel)", () => {
    assert.equal(canCancel("none"), false);
  });

  test("returns true for canceled subscriptions (same-state is valid)", () => {
    // canCancel uses canTransition, which allows same-state transitions
    assert.equal(canCancel("canceled"), true);
  });
});

describe("canResume", () => {
  test("returns true for canceled subscriptions", () => {
    assert.equal(canResume("canceled"), true);
  });

  test("returns true for paused subscriptions", () => {
    assert.equal(canResume("paused"), true);
  });

  test("returns false for active subscriptions", () => {
    assert.equal(canResume("active"), false);
  });

  test("returns false for trialing subscriptions", () => {
    assert.equal(canResume("trialing"), false);
  });

  test("returns false for past_due subscriptions", () => {
    assert.equal(canResume("past_due"), false);
  });

  test("returns false for none status", () => {
    assert.equal(canResume("none"), false);
  });
});

describe("shouldPromptUpgrade", () => {
  test("returns true for none status (no subscription)", () => {
    assert.equal(shouldPromptUpgrade("none"), true);
  });

  test("returns true for canceled subscriptions", () => {
    assert.equal(shouldPromptUpgrade("canceled"), true);
  });

  test("returns false for active subscriptions", () => {
    assert.equal(shouldPromptUpgrade("active"), false);
  });

  test("returns false for trialing subscriptions", () => {
    assert.equal(shouldPromptUpgrade("trialing"), false);
  });

  test("returns false for past_due subscriptions", () => {
    assert.equal(shouldPromptUpgrade("past_due"), false);
  });

  test("returns false for paused subscriptions", () => {
    assert.equal(shouldPromptUpgrade("paused"), false);
  });
});

describe("getStatusLabel", () => {
  test("returns correct label for none", () => {
    assert.equal(getStatusLabel("none"), "No subscription");
  });

  test("returns correct label for trialing", () => {
    assert.equal(getStatusLabel("trialing"), "Trial");
  });

  test("returns correct label for active", () => {
    assert.equal(getStatusLabel("active"), "Active");
  });

  test("returns correct label for past_due", () => {
    assert.equal(getStatusLabel("past_due"), "Past due");
  });

  test("returns correct label for canceled", () => {
    assert.equal(getStatusLabel("canceled"), "Canceled");
  });

  test("returns correct label for paused", () => {
    assert.equal(getStatusLabel("paused"), "Paused");
  });
});

describe("getStatusAfterPayment", () => {
  test("returns active for none status", () => {
    assert.equal(getStatusAfterPayment("none"), "active");
  });

  test("returns active for trialing status (trial converts)", () => {
    assert.equal(getStatusAfterPayment("trialing"), "active");
  });

  test("returns active for active status (renewal)", () => {
    assert.equal(getStatusAfterPayment("active"), "active");
  });

  test("returns active for past_due status (payment recovered)", () => {
    assert.equal(getStatusAfterPayment("past_due"), "active");
  });

  test("returns active for canceled status (resubscribe)", () => {
    assert.equal(getStatusAfterPayment("canceled"), "active");
  });

  test("returns active for paused status (resume with payment)", () => {
    assert.equal(getStatusAfterPayment("paused"), "active");
  });
});

describe("getStatusAfterPaymentFailure", () => {
  test("returns past_due for active status (first failure)", () => {
    assert.equal(getStatusAfterPaymentFailure("active"), "past_due");
  });

  test("returns past_due for trialing status (trial payment failed)", () => {
    assert.equal(getStatusAfterPaymentFailure("trialing"), "past_due");
  });

  test("returns canceled for past_due status (repeated failure)", () => {
    assert.equal(getStatusAfterPaymentFailure("past_due"), "canceled");
  });

  test("returns same status for none (no change)", () => {
    assert.equal(getStatusAfterPaymentFailure("none"), "none");
  });

  test("returns same status for canceled (already canceled)", () => {
    assert.equal(getStatusAfterPaymentFailure("canceled"), "canceled");
  });

  test("returns same status for paused (no payment expected)", () => {
    assert.equal(getStatusAfterPaymentFailure("paused"), "paused");
  });
});
