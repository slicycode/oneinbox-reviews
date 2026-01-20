import { z } from "zod";

/**
 * Plan tier identifiers
 */
export const planTierSchema = z.enum(["free", "starter"]);
export type PlanTier = z.infer<typeof planTierSchema>;

/**
 * Billing interval options
 */
export const billingIntervalSchema = z.enum(["monthly", "yearly"]);
export type BillingInterval = z.infer<typeof billingIntervalSchema>;

/**
 * Features available in the application
 */
export const featureSchema = z.enum([
  "unlimited_reviews",
  "email_alerts",
  "priority_support",
  "advanced_filters",
]);
export type Feature = z.infer<typeof featureSchema>;

/**
 * Plan limits/quotas configuration
 */
export interface PlanLimits {
  maxReviews: number | null; // null = unlimited
  maxGoogleAccounts: number;
  emailAlertsEnabled: boolean;
  retentionDays: number;
}

/**
 * Pricing configuration for a plan
 */
export interface PlanPricing {
  monthly: {
    price: number; // in cents
    dodoProductId: string | null;
  };
  yearly: {
    price: number; // in cents
    dodoProductId: string | null;
  };
}

/**
 * Full plan configuration
 */
export interface PlanConfig {
  tier: PlanTier;
  name: string;
  description: string;
  features: Feature[];
  limits: PlanLimits;
  pricing: PlanPricing;
  trialDays: number;
  isDefault: boolean;
}

/**
 * Trial period duration in days
 */
export const TRIAL_PERIOD_DAYS = 14;

/**
 * Plan configurations
 */
export const plansConfig: Record<PlanTier, PlanConfig> = {
  free: {
    tier: "free",
    name: "Free",
    description: "Get started with basic review management",
    features: [],
    limits: {
      maxReviews: 50,
      maxGoogleAccounts: 1,
      emailAlertsEnabled: false,
      retentionDays: 30,
    },
    pricing: {
      monthly: { price: 0, dodoProductId: null },
      yearly: { price: 0, dodoProductId: null },
    },
    trialDays: 0,
    isDefault: true,
  },
  starter: {
    tier: "starter",
    name: "Starter",
    description: "For growing businesses that need more power",
    features: ["unlimited_reviews", "email_alerts", "advanced_filters"],
    limits: {
      maxReviews: null, // unlimited
      maxGoogleAccounts: 1, // PRD: "1 user, Google only"
      emailAlertsEnabled: true,
      retentionDays: 365,
    },
    pricing: {
      monthly: {
        price: 4900, // $49.00 per PRD
        dodoProductId: process.env.DODO_STARTER_MONTHLY_PRODUCT_ID || null,
      },
      yearly: {
        price: 49000, // $490.00 (2 months free)
        dodoProductId: process.env.DODO_STARTER_YEARLY_PRODUCT_ID || null,
      },
    },
    trialDays: TRIAL_PERIOD_DAYS,
    isDefault: false,
  },
};

/**
 * Get plan configuration by tier
 */
export function getPlanConfig(tier: PlanTier): PlanConfig {
  return plansConfig[tier];
}

/**
 * Get the default plan configuration
 */
export function getDefaultPlanConfig(): PlanConfig {
  const defaultPlan = Object.values(plansConfig).find((plan) => plan.isDefault);
  if (!defaultPlan) {
    throw new Error("No default plan configured");
  }
  return defaultPlan;
}

/**
 * Check if a feature is included in a plan
 */
export function planHasFeature(tier: PlanTier, feature: Feature): boolean {
  const plan = getPlanConfig(tier);
  return plan.features.includes(feature);
}

/**
 * Get plan limits for a given tier
 */
export function getPlanLimits(tier: PlanTier): PlanLimits {
  return getPlanConfig(tier).limits;
}

/**
 * Get Dodo product ID for a plan and billing interval
 */
export function getDodoProductId(
  tier: PlanTier,
  interval: BillingInterval
): string | null {
  const plan = getPlanConfig(tier);
  return plan.pricing[interval].dodoProductId;
}

/**
 * Get all paid plan tiers (excludes free)
 */
export function getPaidPlanTiers(): PlanTier[] {
  return Object.values(plansConfig)
    .filter((plan) => plan.pricing.monthly.price > 0)
    .map((plan) => plan.tier);
}

/**
 * Validate that a string is a valid plan tier
 */
export function isValidPlanTier(tier: string): tier is PlanTier {
  return planTierSchema.safeParse(tier).success;
}
