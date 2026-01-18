import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { reviews } from "./reviews";
import { users } from "./user";

export const reviewResponseStatusEnum = pgEnum("review_response_status", [
  "pending",
  "sent",
  "failed",
]);

export const reviewResponses = pgTable(
  "review_responses",
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
    provider: text("provider").notNull(),
    responseText: text("response_text").notNull(),
    status: reviewResponseStatusEnum("status").default("pending").notNull(),
    providerResponseId: text("provider_response_id"),
    errorMessage: text("error_message"),
    sentAt: timestamp("sent_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    reviewIdIdx: index("review_responses_review_id_idx").on(table.reviewId),
    userIdIdx: index("review_responses_user_id_idx").on(table.userId),
    statusIdx: index("review_responses_status_idx").on(table.status),
    createdAtIdx: index("review_responses_created_at_idx").on(table.createdAt),
  })
);
