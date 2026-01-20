import { NextResponse } from "next/server";
import {
  type Feature,
  type PlanTier,
  getPlanConfig,
} from "@/lib/plans/config";
import {
  getUserPlanTier,
  getUserPlanLimits,
  canAccessFeature,
} from "./access-control";

/**
 * Standard error codes for plan enforcement
 */
export const PlanEnforcementErrorCode = {
  UPGRADE_REQUIRED: "upgrade_required",
  FEATURE_NOT_AVAILABLE: "feature_not_available",
  REVIEW_LIMIT_REACHED: "review_limit_reached",
  ACCOUNT_LIMIT_REACHED: "account_limit_reached",
  DATA_RETENTION_EXCEEDED: "data_retention_exceeded",
} as const;

export type PlanEnforcementErrorCode =
  (typeof PlanEnforcementErrorCode)[keyof typeof PlanEnforcementErrorCode];

/**
 * Feature display names for error messages
 */
const featureDisplayNames: Record<Feature, string> = {
  unlimited_reviews: "Unlimited reviews",
  email_alerts: "Email alerts",
  priority_support: "Priority support",
  advanced_filters: "Advanced filters",
};

/**
 * Standard upgrade required response structure
 */
export interface UpgradeRequiredResponse {
  error: {
    code: PlanEnforcementErrorCode;
    message: string;
    feature?: Feature;
    currentPlan?: PlanTier;
    currentLimit?: number | null;
    currentUsage?: number;
  };
  upgradeRequired: true;
}

/**
 * Create a standardized 403 response for upgrade required scenarios
 */
export function createUpgradeRequiredResponse(
  code: PlanEnforcementErrorCode,
  message: string,
  details?: {
    feature?: Feature;
    currentPlan?: PlanTier;
    currentLimit?: number | null;
    currentUsage?: number;
  },
): NextResponse<UpgradeRequiredResponse> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...details,
      },
      upgradeRequired: true,
    },
    { status: 403 },
  );
}

/**
 * Enforce feature access for an API route
 * Returns null if access is allowed, or a NextResponse if denied
 */
export async function enforceFeatureAccess(
  userId: string,
  feature: Feature,
): Promise<NextResponse<UpgradeRequiredResponse> | null> {
  const hasAccess = await canAccessFeature(userId, feature);

  if (!hasAccess) {
    const planTier = await getUserPlanTier(userId);
    const featureName = featureDisplayNames[feature];

    return createUpgradeRequiredResponse(
      PlanEnforcementErrorCode.FEATURE_NOT_AVAILABLE,
      `${featureName} requires a Starter plan or higher`,
      {
        feature,
        currentPlan: planTier,
      },
    );
  }

  return null;
}

/**
 * Enforce review limit for an API route
 * Returns null if within limit, or a NextResponse if limit exceeded
 */
export async function enforceReviewLimit(
  userId: string,
  currentReviewCount: number,
): Promise<NextResponse<UpgradeRequiredResponse> | null> {
  const limits = await getUserPlanLimits(userId);

  // null means unlimited
  if (limits.maxReviews === null) {
    return null;
  }

  if (currentReviewCount >= limits.maxReviews) {
    const planTier = await getUserPlanTier(userId);

    return createUpgradeRequiredResponse(
      PlanEnforcementErrorCode.REVIEW_LIMIT_REACHED,
      `You've reached your limit of ${limits.maxReviews} reviews. Upgrade to access unlimited reviews.`,
      {
        feature: "unlimited_reviews",
        currentPlan: planTier,
        currentLimit: limits.maxReviews,
        currentUsage: currentReviewCount,
      },
    );
  }

  return null;
}

/**
 * Enforce Google account limit for an API route
 * Returns null if within limit, or a NextResponse if limit exceeded
 */
export async function enforceAccountLimit(
  userId: string,
  currentAccountCount: number,
): Promise<NextResponse<UpgradeRequiredResponse> | null> {
  const limits = await getUserPlanLimits(userId);

  if (currentAccountCount >= limits.maxGoogleAccounts) {
    const planTier = await getUserPlanTier(userId);

    return createUpgradeRequiredResponse(
      PlanEnforcementErrorCode.ACCOUNT_LIMIT_REACHED,
      `You've reached your limit of ${limits.maxGoogleAccounts} Google account(s). Upgrade to connect more accounts.`,
      {
        currentPlan: planTier,
        currentLimit: limits.maxGoogleAccounts,
        currentUsage: currentAccountCount,
      },
    );
  }

  return null;
}

/**
 * Check if a review date is within the user's retention period
 * Returns null if within retention, or a NextResponse if exceeded
 */
export async function enforceDataRetention(
  userId: string,
  reviewDate: Date,
): Promise<NextResponse<UpgradeRequiredResponse> | null> {
  const limits = await getUserPlanLimits(userId);
  const now = new Date();
  const retentionCutoff = new Date(
    now.getTime() - limits.retentionDays * 24 * 60 * 60 * 1000,
  );

  if (reviewDate < retentionCutoff) {
    const planTier = await getUserPlanTier(userId);

    return createUpgradeRequiredResponse(
      PlanEnforcementErrorCode.DATA_RETENTION_EXCEEDED,
      `This review is outside your ${limits.retentionDays}-day retention period. Upgrade for longer data retention.`,
      {
        currentPlan: planTier,
        currentLimit: limits.retentionDays,
      },
    );
  }

  return null;
}

/**
 * Get enforcement context for a user
 * Useful when you need to check multiple limits at once
 */
export async function getEnforcementContext(userId: string) {
  const planTier = await getUserPlanTier(userId);
  const limits = await getUserPlanLimits(userId);
  const planConfig = getPlanConfig(planTier);

  return {
    planTier,
    planName: planConfig.name,
    limits,
    features: planConfig.features,
    canAccessFeature: (feature: Feature) =>
      planConfig.features.includes(feature),
    isWithinReviewLimit: (count: number) =>
      limits.maxReviews === null || count < limits.maxReviews,
    isWithinAccountLimit: (count: number) => count < limits.maxGoogleAccounts,
    getRetentionCutoffDate: () =>
      new Date(Date.now() - limits.retentionDays * 24 * 60 * 60 * 1000),
  };
}
