import { z } from "zod";
import type { SubscriptionStatus } from "@/db/schema/subscriptions";

/**
 * Subscription status schema for validation
 */
export const subscriptionStatusSchema = z.enum([
  "none",
  "trialing",
  "active",
  "past_due",
  "canceled",
  "paused",
]);

/**
 * Valid state transitions map
 *
 * Each key is a "from" state, and the value is an array of valid "to" states.
 *
 * Flow:
 * - none → trialing (start trial) or active (direct subscribe)
 * - trialing → active (trial converts) or canceled (cancel during trial)
 * - active → canceled (user cancels) or past_due (payment failed) or paused (pause subscription)
 * - past_due → active (payment recovered) or canceled (payment failed permanently)
 * - canceled → active (resubscribe) or trialing (new trial after cancel)
 * - paused → active (resume) or canceled (cancel while paused)
 */
const validTransitions: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  none: ["trialing", "active"],
  trialing: ["active", "canceled", "none"],
  active: ["canceled", "past_due", "paused"],
  past_due: ["active", "canceled"],
  canceled: ["active", "trialing", "none"],
  paused: ["active", "canceled"],
};

/**
 * Check if a state transition is valid
 */
export function canTransition(
  from: SubscriptionStatus,
  to: SubscriptionStatus
): boolean {
  // Same state is always valid (no-op)
  if (from === to) {
    return true;
  }

  const allowedTargets = validTransitions[from];
  return allowedTargets.includes(to);
}

/**
 * Get all valid target states from a given state
 */
export function getValidTransitions(
  from: SubscriptionStatus
): SubscriptionStatus[] {
  return validTransitions[from];
}

/**
 * Determine if a subscription is in an "active" billing state
 * (user has access to paid features)
 */
export function isActiveSubscription(status: SubscriptionStatus): boolean {
  return status === "active" || status === "trialing" || status === "past_due";
}

/**
 * Determine if a subscription can be canceled
 */
export function canCancel(status: SubscriptionStatus): boolean {
  return canTransition(status, "canceled");
}

/**
 * Determine if a subscription can be resumed
 * (only applicable for canceled subscriptions before period end)
 */
export function canResume(status: SubscriptionStatus): boolean {
  return status === "canceled" || status === "paused";
}

/**
 * Determine if user should be prompted to upgrade
 */
export function shouldPromptUpgrade(status: SubscriptionStatus): boolean {
  return status === "none" || status === "canceled";
}

/**
 * Get a human-readable label for a subscription status
 */
export function getStatusLabel(status: SubscriptionStatus): string {
  const labels: Record<SubscriptionStatus, string> = {
    none: "No subscription",
    trialing: "Trial",
    active: "Active",
    past_due: "Past due",
    canceled: "Canceled",
    paused: "Paused",
  };
  return labels[status];
}

/**
 * Get the next logical status after a successful payment
 */
export function getStatusAfterPayment(
  currentStatus: SubscriptionStatus
): SubscriptionStatus {
  switch (currentStatus) {
    case "none":
    case "trialing":
    case "past_due":
    case "canceled":
    case "paused":
      return "active";
    case "active":
      return "active";
    default:
      return "active";
  }
}

/**
 * Get the next logical status after a failed payment
 */
export function getStatusAfterPaymentFailure(
  currentStatus: SubscriptionStatus
): SubscriptionStatus {
  switch (currentStatus) {
    case "active":
    case "trialing":
      return "past_due";
    case "past_due":
      return "canceled";
    default:
      return currentStatus;
  }
}
