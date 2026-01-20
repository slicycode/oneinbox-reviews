import { NextResponse } from "next/server";
import withAuthRequired from "@/lib/auth/withAuthRequired";
import { db } from "@/db";
import { reviews } from "@/db/schema/reviews";
import { reviewExports } from "@/db/schema/review-exports";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { reviewFiltersSchema } from "@/lib/validations/review-filters.schema";
import { enforceFeatureAccess } from "@/lib/subscriptions/api-enforcement";

const sanitizeCsvValue = (value: string) => {
  const stripped = value.replace(/^[\t\r\n ]+/, "");
  if (/^[=+\-@]/.test(stripped)) {
    return `'${value}`;
  }
  return value;
};

const escapeCsv = (value: string) => {
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export const GET = withAuthRequired(async (req, context) => {
  const { searchParams } = new URL(req.url);
  const queryParams = searchParams.toString();
  const parsedFilters = reviewFiltersSchema.safeParse({
    ratingMin: searchParams.get("rating_min"),
    ratingMax: searchParams.get("rating_max"),
    dateFrom: searchParams.get("date_from"),
    dateTo: searchParams.get("date_to"),
    query: searchParams.get("q"),
  });
  const filters = parsedFilters.success ? parsedFilters.data : {};

  // Check if user is trying to use advanced filters (requires Starter plan)
  const hasFilters =
    filters.ratingMin !== undefined ||
    filters.ratingMax !== undefined ||
    filters.dateFrom !== undefined ||
    filters.dateTo !== undefined ||
    filters.query !== undefined;

  if (hasFilters) {
    const enforcementError = await enforceFeatureAccess(
      context.session.user.id,
      "advanced_filters",
    );
    if (enforcementError) {
      return enforcementError;
    }
  }

  const conditions = [eq(reviews.userId, context.session.user.id)];
  if (filters.ratingMin !== undefined) {
    conditions.push(gte(reviews.rating, filters.ratingMin));
  }
  if (filters.ratingMax !== undefined) {
    conditions.push(lte(reviews.rating, filters.ratingMax));
  }
  if (filters.dateFrom) {
    conditions.push(gte(reviews.reviewCreatedAt, filters.dateFrom));
  }
  if (filters.dateTo) {
    conditions.push(lte(reviews.reviewCreatedAt, filters.dateTo));
  }
  if (filters.query) {
    const term = `%${filters.query}%`;
    conditions.push(
      sql`${reviews.content} ILIKE ${term} OR COALESCE(${reviews.authorName}, '') ILIKE ${term}`,
    );
  }

  const rows = await db
    .select({
      provider: reviews.provider,
      rating: reviews.rating,
      authorName: reviews.authorName,
      content: reviews.content,
      reviewCreatedAt: reviews.reviewCreatedAt,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(and(...conditions))
    .orderBy(desc(reviews.reviewCreatedAt));

  const header = [
    "provider",
    "rating",
    "author",
    "content",
    "review_created_at",
    "ingested_at",
  ];

  const lines = [
    header.join(","),
    ...rows.map((row) => {
      const fields = [
        row.provider,
        String(row.rating),
        row.authorName ?? "",
        row.content ?? "",
        row.reviewCreatedAt.toISOString(),
        row.createdAt.toISOString(),
      ];
      return fields
        .map((field) => escapeCsv(sanitizeCsvValue(field)))
        .join(",");
    }),
  ];

  const csv = lines.join("\n");
  const filename = `reviews-${new Date().toISOString().slice(0, 10)}.csv`;

  await db.insert(reviewExports).values({
    userId: context.session.user.id,
    status: "completed",
    queryParams: queryParams.length > 0 ? queryParams : null,
    rowCount: rows.length,
    completedAt: new Date(),
  });

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
});
