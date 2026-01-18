import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./user";

export const reviewExportStatusEnum = pgEnum("review_export_status", [
  "completed",
  "failed",
  "queued",
]);

export const reviewExports = pgTable(
  "review_exports",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: reviewExportStatusEnum("status").default("completed").notNull(),
    queryParams: text("query_params"),
    rowCount: integer("row_count"),
    error: text("error"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { mode: "date" }),
  },
  (table) => ({
    userIdIdx: index("review_exports_user_id_idx").on(table.userId),
    statusIdx: index("review_exports_status_idx").on(table.status),
    createdAtIdx: index("review_exports_created_at_idx").on(table.createdAt),
  })
);
