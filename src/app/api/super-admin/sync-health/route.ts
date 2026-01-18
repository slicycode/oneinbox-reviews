import { db } from "@/db";
import { reviewSyncStatus } from "@/db/schema/review-sync-status";
import { users } from "@/db/schema/user";
import withSuperAdminAuthRequired from "@/lib/auth/withSuperAdminAuthRequired";
import { and, desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

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
        sql`${users.email} ILIKE ${term} OR ${users.name} ILIKE ${term}`
      );
    }
    if (provider && provider !== "all") {
      conditions.push(eq(reviewSyncStatus.provider, provider));
    }
    if (status && status !== "all") {
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
