import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions } from "@/db/schema/subscriptions";
import {
  type Feature,
  type PlanLimits,
  type PlanTier,
  getPlanConfig,
  getPlanLimits as getConfigPlanLimits,
  planHasFeature,
} from "@/lib/plans/config";
import { isActiveSubscription } from "./state-machine";

/**
 * Get user's current subscription from database
 */
export async function getUserSubscription(userId: string) {
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  return result[0] || null;
}

/**
 * Get user's effective plan tier
 * Returns 'free' if no subscription or subscription is not active
 */
export async function getUserPlanTier(userId: string): Promise<PlanTier> {
  const subscription = await getUserSubscription(userId);

  if (!subscription) {
    return "free";
  }

  // Only return paid tier if subscription is in active state
  if (isActiveSubscription(subscription.status)) {
    return subscription.planTier as PlanTier;
  }

  return "free";
}

/**
 * Check if a user can access a specific feature
 */
export async function canAccessFeature(
  userId: string,
  feature: Feature
): Promise<boolean> {
  const planTier = await getUserPlanTier(userId);
  return planHasFeature(planTier, feature);
}

/**
 * Get plan limits for a given tier
 * Re-exported from config for convenience
 */
export function getPlanLimits(planTier: PlanTier): PlanLimits {
  return getConfigPlanLimits(planTier);
}

/**
 * Get plan limits for a user based on their subscription
 */
export async function getUserPlanLimits(userId: string): Promise<PlanLimits> {
  const planTier = await getUserPlanTier(userId);
  return getPlanLimits(planTier);
}

/**
 * Check if a user needs to upgrade to access a feature
 */
export async function requiresUpgrade(
  userId: string,
  feature: Feature
): Promise<boolean> {
  const canAccess = await canAccessFeature(userId, feature);
  return !canAccess;
}

/**
 * Check if user has reached their review limit
 */
export async function hasReachedReviewLimit(
  userId: string,
  currentReviewCount: number
): Promise<boolean> {
  const limits = await getUserPlanLimits(userId);

  // null means unlimited
  if (limits.maxReviews === null) {
    return false;
  }

  return currentReviewCount >= limits.maxReviews;
}

/**
 * Check if user has reached their Google account limit
 */
export async function hasReachedAccountLimit(
  userId: string,
  currentAccountCount: number
): Promise<boolean> {
  const limits = await getUserPlanLimits(userId);
  return currentAccountCount >= limits.maxGoogleAccounts;
}

/**
 * Get upgrade context for a feature
 * Returns info to display in upgrade prompts
 */
export async function getUpgradeContext(
  userId: string,
  feature: Feature
): Promise<{
  requiresUpgrade: boolean;
  currentPlan: PlanTier;
  currentPlanName: string;
  featureName: string;
}> {
  const planTier = await getUserPlanTier(userId);
  const planConfig = getPlanConfig(planTier);
  const needsUpgrade = !planHasFeature(planTier, feature);

  const featureNames: Record<Feature, string> = {
    unlimited_reviews: "Unlimited reviews",
    email_alerts: "Email alerts",
    priority_support: "Priority support",
    advanced_filters: "Advanced filters",
  };

  return {
    requiresUpgrade: needsUpgrade,
    currentPlan: planTier,
    currentPlanName: planConfig.name,
    featureName: featureNames[feature],
  };
}

/**
 * Synchronous version for when you already have the plan tier
 * Useful in contexts where you've already fetched subscription data
 */
export const AccessControl = {
  canAccessFeature: (planTier: PlanTier, feature: Feature): boolean => {
    return planHasFeature(planTier, feature);
  },

  getPlanLimits: (planTier: PlanTier): PlanLimits => {
    return getConfigPlanLimits(planTier);
  },

  requiresUpgrade: (planTier: PlanTier, feature: Feature): boolean => {
    return !planHasFeature(planTier, feature);
  },

  hasReachedReviewLimit: (
    planTier: PlanTier,
    currentReviewCount: number
  ): boolean => {
    const limits = getConfigPlanLimits(planTier);
    if (limits.maxReviews === null) return false;
    return currentReviewCount >= limits.maxReviews;
  },

  hasReachedAccountLimit: (
    planTier: PlanTier,
    currentAccountCount: number
  ): boolean => {
    const limits = getConfigPlanLimits(planTier);
    return currentAccountCount >= limits.maxGoogleAccounts;
  },
};
