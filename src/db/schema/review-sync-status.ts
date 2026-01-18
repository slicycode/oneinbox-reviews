import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./user";

export const reviewSyncStatus = pgTable(
  "review_sync_status",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    status: text("status").notNull().default("active"),
    lastSuccessAt: timestamp("last_success_at", { mode: "date" }),
    lastAttemptAt: timestamp("last_attempt_at", { mode: "date" }),
    lastError: text("last_error"),
    lastAlertAt: timestamp("last_alert_at", { mode: "date" }),
    lastAlertStatus: text("last_alert_status"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("review_sync_status_user_id_idx").on(table.userId),
    providerIdx: index("review_sync_status_provider_idx").on(table.provider),
    lastSuccessIdx: index("review_sync_status_last_success_idx").on(
      table.lastSuccessAt
    ),
    userProviderUnique: uniqueIndex("review_sync_status_user_provider_unique").on(
      table.userId,
      table.provider
    ),
  })
);
