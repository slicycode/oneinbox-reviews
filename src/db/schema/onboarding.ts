import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./user";

export const onboardingProgress = pgTable(
  "onboarding_progress",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    connectGoogle: boolean("connect_google").default(false).notNull(),
    syncReviews: boolean("sync_reviews").default(false).notNull(),
    viewInbox: boolean("view_inbox").default(false).notNull(),
    setupAlerts: boolean("setup_alerts").default(false).notNull(),
    dismissed: boolean("dismissed").default(false).notNull(),
    completedAt: timestamp("completed_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("onboarding_progress_user_id_idx").on(table.userId),
    userIdUnique: uniqueIndex("onboarding_progress_user_id_unique").on(
      table.userId
    ),
  })
);
