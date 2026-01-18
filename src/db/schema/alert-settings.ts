import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./user";

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
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("alert_settings_user_id_idx").on(table.userId),
    userIdUnique: uniqueIndex("alert_settings_user_id_unique").on(table.userId),
  })
);
