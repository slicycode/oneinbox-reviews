import { NextResponse } from "next/server";
import withSuperAdminAuthRequired from "@/lib/auth/withSuperAdminAuthRequired";
import { manualSyncSchema } from "@/lib/validations/manual-sync.schema";
import { enqueueReviewSync } from "@/lib/jobs/reviews-sync";
import { db } from "@/db";
import { accounts } from "@/db/schema/user";
import { and, eq } from "drizzle-orm";

export const POST = withSuperAdminAuthRequired(async (req) => {
  const payload = await req.json().catch(() => null);
  const parsed = manualSyncSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_payload",
          message: "Invalid manual sync payload",
        },
      },
      { status: 400 }
    );
  }

  const { userId, provider } = parsed.data;
  const account = await db
    .select({ providerAccountId: accounts.providerAccountId })
    .from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.provider, provider)))
    .limit(1)
    .then((rows) => rows[0]);

  if (!account) {
    return NextResponse.json(
      {
        error: {
          code: "provider_not_connected",
          message: "Provider connection not found for user",
        },
      },
      { status: 404 }
    );
  }

  const job = await enqueueReviewSync(
    userId,
    provider,
    "manual",
    account.providerAccountId
  );

  return NextResponse.json({ job });
});
