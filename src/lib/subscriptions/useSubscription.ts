import { MeResponse } from "@/app/api/app/me/types";
import useSWR from "swr";

export interface SubscriptionInfo {
  planTier: "free" | "starter";
  status: "active" | "trialing" | "past_due" | "canceled" | "paused" | "none";
  isActive: boolean;
  isTrial: boolean;
  isPastDue: boolean;
  isCanceling: boolean;
  trialDaysRemaining: number | null;
  daysUntilExpiry: number | null;
  currentPeriodEnd: Date | null;
}

function calculateDaysRemaining(date: Date | string | null): number | null {
  if (!date) return null;
  const targetDate = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

export function useSubscription() {
  const { data, isLoading, error, mutate } = useSWR<MeResponse>("/api/app/me");

  const subscription = data?.subscription;

  const subscriptionInfo: SubscriptionInfo | null = subscription
    ? {
        planTier: subscription.planTier,
        status: subscription.status,
        isActive:
          subscription.status === "active" ||
          subscription.status === "trialing",
        isTrial: subscription.status === "trialing",
        isPastDue: subscription.status === "past_due",
        isCanceling:
          subscription.cancelAtPeriodEnd && subscription.status === "active",
        trialDaysRemaining: subscription.trialEnd
          ? calculateDaysRemaining(subscription.trialEnd)
          : null,
        daysUntilExpiry: subscription.currentPeriodEnd
          ? calculateDaysRemaining(subscription.currentPeriodEnd)
          : null,
        currentPeriodEnd: subscription.currentPeriodEnd
          ? new Date(subscription.currentPeriodEnd)
          : null,
      }
    : {
        planTier: "free",
        status: "none",
        isActive: false,
        isTrial: false,
        isPastDue: false,
        isCanceling: false,
        trialDaysRemaining: null,
        daysUntilExpiry: null,
        currentPeriodEnd: null,
      };

  return {
    subscription: subscriptionInfo,
    isLoading,
    error,
    mutate,
  };
}

export default useSubscription;
