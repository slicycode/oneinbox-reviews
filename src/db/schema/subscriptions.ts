import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./user";

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "trialing",
  "past_due",
  "canceled",
  "paused",
  "none",
]);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Dodo-specific fields
    dodoSubscriptionId: text("dodo_subscription_id"),
    dodoProductId: text("dodo_product_id"),
    dodoCustomerId: text("dodo_customer_id"),

    // Subscription state
    status: subscriptionStatusEnum("status").default("none").notNull(),
    planTier: text("plan_tier").default("free").notNull(),

    // Billing period tracking
    currentPeriodStart: timestamp("current_period_start", { mode: "date" }),
    currentPeriodEnd: timestamp("current_period_end", { mode: "date" }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),

    // Trial tracking
    trialStart: timestamp("trial_start", { mode: "date" }),
    trialEnd: timestamp("trial_end", { mode: "date" }),

    // Cancellation tracking
    canceledAt: timestamp("canceled_at", { mode: "date" }),

    // Audit fields
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("subscriptions_user_id_idx").on(table.userId),
    dodoSubscriptionIdIdx: index("subscriptions_dodo_subscription_id_idx").on(
      table.dodoSubscriptionId,
    ),
    statusIdx: index("subscriptions_status_idx").on(table.status),
  }),
);

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type SubscriptionStatus =
  (typeof subscriptionStatusEnum.enumValues)[number];
