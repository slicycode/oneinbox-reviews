import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./user";

export const reviews = pgTable(
  "reviews",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerReviewId: text("provider_review_id").notNull(),
    rating: integer("rating").notNull(),
    content: text("content").notNull(),
    authorName: text("author_name"),
    authorUrl: text("author_url"),
    reviewUrl: text("review_url"),
    locationName: text("location_name"),
    reviewCreatedAt: timestamp("review_created_at", { mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("reviews_user_id_idx").on(table.userId),
    providerIdx: index("reviews_provider_idx").on(table.provider),
    createdAtIdx: index("reviews_created_at_idx").on(table.createdAt),
    reviewCreatedAtIdx: index("reviews_review_created_at_idx").on(
      table.reviewCreatedAt
    ),
    providerUnique: uniqueIndex("reviews_provider_unique").on(
      table.userId,
      table.provider,
      table.providerReviewId
    ),
  })
);
