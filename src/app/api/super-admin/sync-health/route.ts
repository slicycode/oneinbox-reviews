import { NextResponse } from "next/server";
import withSuperAdminAuthRequired from "@/lib/auth/withSuperAdminAuthRequired";
import { db } from "@/db";
import { reviewSyncStatus } from "@/db/schema/review-sync-status";
import { users } from "@/db/schema/user";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

export const GET = withSuperAdminAuthRequired(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim();
    const provider = (searchParams.get("provider") || "").trim();
    const status = (searchParams.get("status") || "").trim();

    const conditions = [sql`1=1`];
    if (search) {
      const term = `%${search}%`;
      conditions.push(
        or(ilike(users.email, term), ilike(users.name, term))
      );
    }
    if (provider) {
      conditions.push(eq(reviewSyncStatus.provider, provider));
    }
    if (status) {
      conditions.push(eq(reviewSyncStatus.status, status));
    }

    const rows = await db
      .select({
        userId: reviewSyncStatus.userId,
        provider: reviewSyncStatus.provider,
        status: reviewSyncStatus.status,
        lastSuccessAt: reviewSyncStatus.lastSuccessAt,
        lastAttemptAt: reviewSyncStatus.lastAttemptAt,
        lastError: reviewSyncStatus.lastError,
        email: users.email,
        name: users.name,
      })
      .from(reviewSyncStatus)
      .leftJoin(users, eq(users.id, reviewSyncStatus.userId))
      .where(and(...conditions))
      .orderBy(desc(reviewSyncStatus.updatedAt))
      .limit(100);

    return NextResponse.json({
      rows: rows.map((row) => ({
        ...row,
        lastSuccessAt: row.lastSuccessAt?.toISOString() ?? null,
        lastAttemptAt: row.lastAttemptAt?.toISOString() ?? null,
      })),
    });
  } catch (error) {
    console.error("Error fetching sync health:", error);
    return NextResponse.json(
      { error: "Failed to fetch sync health" },
      { status: 500 }
    );
  }
});
