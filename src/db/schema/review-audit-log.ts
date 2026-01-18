import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { reviews, reviewStatusEnum } from "./reviews";
import { users } from "./user";

export const reviewAuditEventEnum = pgEnum("review_audit_event", [
  "status_change",
]);

export const reviewAuditLog = pgTable(
  "review_audit_log",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    reviewId: text("review_id")
      .notNull()
      .references(() => reviews.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    eventType: reviewAuditEventEnum("event_type").notNull(),
    fromStatus: reviewStatusEnum("from_status"),
    toStatus: reviewStatusEnum("to_status"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    reviewIdIdx: index("review_audit_log_review_id_idx").on(table.reviewId),
    userIdIdx: index("review_audit_log_user_id_idx").on(table.userId),
    eventTypeIdx: index("review_audit_log_event_type_idx").on(
      table.eventType
    ),
    createdAtIdx: index("review_audit_log_created_at_idx").on(table.createdAt),
  })
);
