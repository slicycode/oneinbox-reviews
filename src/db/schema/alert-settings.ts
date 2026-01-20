import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./user";

export const notificationFrequencyEnum = [
  "immediate",
  "daily_digest",
  "weekly_digest",
] as const;
export type NotificationFrequency = (typeof notificationFrequencyEnum)[number];

export const alertSettings = pgTable(
  "alert_settings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    emailAlertsEnabled: boolean("email_alerts_enabled").default(false).notNull(),
    negativeReviewThreshold: integer("negative_review_threshold")
      .default(2)
      .notNull(),
    alertsPaused: boolean("alerts_paused").default(false).notNull(),
    // Notification frequency: immediate, daily_digest, weekly_digest
    notificationFrequency: text("notification_frequency")
      .default("immediate")
      .notNull(),
    // Whether to notify on all reviews or just negative ones
    notifyOnAllReviews: boolean("notify_on_all_reviews").default(false).notNull(),
    // Quiet hours settings
    quietHoursEnabled: boolean("quiet_hours_enabled").default(false).notNull(),
    quietHoursStart: time("quiet_hours_start").default("22:00:00"),
    quietHoursEnd: time("quiet_hours_end").default("08:00:00"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("alert_settings_user_id_idx").on(table.userId),
    userIdUnique: uniqueIndex("alert_settings_user_id_unique").on(table.userId),
  })
);
