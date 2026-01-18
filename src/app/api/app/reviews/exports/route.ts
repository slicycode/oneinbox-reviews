import { NextResponse } from "next/server";
import withAuthRequired from "@/lib/auth/withAuthRequired";
import { db } from "@/db";
import { reviewExports } from "@/db/schema/review-exports";
import { desc, eq } from "drizzle-orm";

export const GET = withAuthRequired(async (_req, context) => {
  const rows = await db
    .select({
      id: reviewExports.id,
      status: reviewExports.status,
      rowCount: reviewExports.rowCount,
      queryParams: reviewExports.queryParams,
      createdAt: reviewExports.createdAt,
      completedAt: reviewExports.completedAt,
    })
    .from(reviewExports)
    .where(eq(reviewExports.userId, context.session.user.id))
    .orderBy(desc(reviewExports.createdAt))
    .limit(20);

  return NextResponse.json({
    exports: rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
      completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    })),
  });
});
