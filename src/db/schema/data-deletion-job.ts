import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./user";

export const dataDeletionJobs = pgTable(
  "data_deletion_job",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    status: text("status").notNull().default("pending"),
    reason: text("reason").notNull(),
    requestedAt: timestamp("requested_at", { mode: "date" })
      .defaultNow()
      .notNull(),
    processedAt: timestamp("processed_at", { mode: "date" }),
    error: text("error"),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("data_deletion_job_user_id_idx").on(table.userId),
    providerIdx: index("data_deletion_job_provider_idx").on(table.provider),
    statusIdx: index("data_deletion_job_status_idx").on(table.status),
    requestedAtIdx: index("data_deletion_job_requested_at_idx").on(
      table.requestedAt
    ),
    userProviderUnique: uniqueIndex("data_deletion_job_user_provider_unique").on(
      table.userId,
      table.provider
    ),
  })
);
