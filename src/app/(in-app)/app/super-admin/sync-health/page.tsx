import { auth, signIn } from "@/auth";
import { db } from "@/db";
import { reviewSyncStatus } from "@/db/schema/review-sync-status";
import { users } from "@/db/schema/user";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { SyncHealthFilters } from "@/features/support/sync-health-filters";
import { SyncHealthTable } from "@/features/support/sync-health-table";

const isSuperAdmin = (email?: string | null) => {
  const allowList = process.env.SUPER_ADMIN_EMAILS?.split(",") ?? [];
  return email ? allowList.includes(email) : false;
};

export default async function SyncHealthPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    return signIn();
  }

  if (!isSuperAdmin(session.user.email)) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold">Not authorized</h1>
        <p className="text-sm text-muted-foreground">
          This page is restricted to super admins.
        </p>
      </div>
    );
  }

  const rawParams = await searchParams;
  const search = typeof rawParams.search === "string" ? rawParams.search : "";
  const provider =
    typeof rawParams.provider === "string" ? rawParams.provider : "";
  const status = typeof rawParams.status === "string" ? rawParams.status : "";

  const conditions = [sql`1=1`];
  if (search.trim()) {
    const term = `%${search.trim()}%`;
    conditions.push(or(ilike(users.email, term), ilike(users.name, term)));
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

  const data = rows.map((row) => ({
    ...row,
    lastSuccessAt: row.lastSuccessAt?.toISOString() ?? null,
    lastAttemptAt: row.lastAttemptAt?.toISOString() ?? null,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Sync Health (Support)
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor review sync status across customer accounts.
        </p>
      </div>
      <SyncHealthFilters />
      <SyncHealthTable rows={data} />
    </div>
  );
}
