import { plans } from "@/db/schema/plans";
import { users } from "@/db/schema/user";
import type { SubscriptionStatus } from "@/db/schema/subscriptions";
import type { PlanTier } from "@/lib/plans/config";

export interface MeResponse {
  currentPlan: {
    id: (typeof plans.$inferSelect)["id"];
    name: (typeof plans.$inferSelect)["name"];
    codename: (typeof plans.$inferSelect)["codename"];
    quotas: (typeof plans.$inferSelect)["quotas"];
    default: (typeof plans.$inferSelect)["default"];
  } | null;
  user: Omit<typeof users.$inferSelect, "password">;
  subscription: {
    status: SubscriptionStatus;
    planTier: PlanTier;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
    trialEnd: Date | null;
  } | null;
}
