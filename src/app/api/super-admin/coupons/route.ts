import { NextResponse } from "next/server";
import withSuperAdminAuthRequired from "@/lib/auth/withSuperAdminAuthRequired";
import { db } from "@/db";
import { coupons } from "@/db/schema/coupons";
import { desc, eq, like, sql, and, isNull, isNotNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";

// Validation schemas
const couponQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().max(100).default(""),
  status: z.enum(["all", "used", "unused", "expired"]).default("all"),
});

const generateCouponsSchema = z.object({
  prefix: z.string().min(1).max(20).regex(/^[A-Z0-9]+$/i, "Prefix must be alphanumeric"),
  count: z.number().int().positive().max(1000, "Cannot generate more than 1000 coupons at once"),
});

export const GET = withSuperAdminAuthRequired(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const queryValidation = couponQuerySchema.safeParse({
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 10,
      search: searchParams.get("search") ?? "",
      status: searchParams.get("status") ?? "all",
    });

    const { page, limit, search, status } = queryValidation.success
      ? queryValidation.data
      : { page: 1, limit: 10, search: "", status: "all" as const };

    const offset = (page - 1) * limit;

    const conditions = [];

    if (search) {
      conditions.push(like(coupons.code, `%${search}%`));
    }

    if (status === "used") {
      conditions.push(isNotNull(coupons.usedAt));
    } else if (status === "unused") {
      conditions.push(isNull(coupons.usedAt));
      conditions.push(eq(coupons.expired, false));
    } else if (status === "expired") {
      conditions.push(eq(coupons.expired, true));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [couponsList, totalCount] = await Promise.all([
      db
        .select()
        .from(coupons)
        .where(whereClause)
        .orderBy(desc(coupons.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(coupons)
        .where(whereClause)
        .then((res) => Number(res[0].count)),
    ]);

    return NextResponse.json({
      coupons: couponsList,
      totalItems: totalCount,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
});

export const POST = withSuperAdminAuthRequired(async (req) => {
  try {
    const body = await req.json();

    // Validate input with Zod schema
    const validation = generateCouponsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { prefix, count } = validation.data;

    const codes = Array.from({ length: count }, () => {
      const uniquePart = nanoid(8).toUpperCase();
      return `${prefix}-${uniquePart}`;
    });

    const couponsToInsert = codes.map((code) => ({
      code,
      expired: false,
    }));

    await db.insert(coupons).values(couponsToInsert);

    return NextResponse.json({ codes });
  } catch (error) {
    console.error("Error generating coupons:", error);
    return NextResponse.json(
      { error: "Failed to generate coupons" },
      { status: 500 }
    );
  }
}); 