import { eq } from "drizzle-orm";

import { db } from "@/db";
import { subscriptions, type SubscriptionStatus } from "@/db/schema/subscriptions";
import {
  type PlanTier,
  type PlanConfig,
  type PlanLimits,
  getPlanConfig,
  getDefaultPlanConfig,
} from "@/lib/plans/config";
import { isActiveSubscription } from "@/lib/subscriptions/state-machine";

/**
 * User plan response with subscription status
 */
export interface UserPlanResponse {
  planTier: PlanTier;
  planConfig: PlanConfig;
  limits: PlanLimits;
  subscription: {
    id: string;
    status: SubscriptionStatus;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
    trialEnd: Date | null;
  } | null;
  isActive: boolean;
  isTrial: boolean;
}

/**
 * Get user's current plan and subscription status
 */
const getUserPlan = async (userId: string): Promise<UserPlanResponse> => {
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  const subscription = result[0];

  // No subscription - return free plan
  if (!subscription) {
    const defaultPlan = getDefaultPlanConfig();
    return {
      planTier: "free",
      planConfig: defaultPlan,
      limits: defaultPlan.limits,
      subscription: null,
      isActive: false,
      isTrial: false,
    };
  }

  // Determine effective plan tier based on subscription status
  const isActive = isActiveSubscription(subscription.status);
  const effectiveTier: PlanTier = isActive
    ? (subscription.planTier as PlanTier)
    : "free";
  const planConfig = getPlanConfig(effectiveTier);

  return {
    planTier: effectiveTier,
    planConfig,
    limits: planConfig.limits,
    subscription: {
      id: subscription.id,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      trialEnd: subscription.trialEnd,
    },
    isActive,
    isTrial: subscription.status === "trialing",
  };
};

export default getUserPlan;
