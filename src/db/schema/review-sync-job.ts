import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./user";

export const reviewSyncJobs = pgTable(
  "review_sync_job",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    jobType: text("job_type").notNull(),
    status: text("status").notNull().default("pending"),
    idempotencyKey: text("idempotency_key").notNull(),
    requestedAt: timestamp("requested_at", { mode: "date" })
      .defaultNow()
      .notNull(),
    processedAt: timestamp("processed_at", { mode: "date" }),
    error: text("error"),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("review_sync_job_user_id_idx").on(table.userId),
    statusIdx: index("review_sync_job_status_idx").on(table.status),
    requestedAtIdx: index("review_sync_job_requested_at_idx").on(
      table.requestedAt
    ),
    idempotencyUnique: uniqueIndex("review_sync_job_idempotency_key_unique").on(
      table.idempotencyKey
    ),
  })
);
