import { auth, signIn } from "@/auth";
import { db } from "@/db";
import { accounts } from "@/db/schema/user";
import { eq, and, sql } from "drizzle-orm";
import { GoogleConnectionCard } from "@/features/integrations/google-connection-card";

export default async function IntegrationsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return signIn();
  }

  const googleAccount = await db
    .select({
      providerAccountId: accounts.providerAccountId,
      connectionStatus: accounts.connectionStatus,
      lastAuthAt: accounts.lastAuthAt,
      expiresAt: accounts.expires_at,
      isExpired: sql<boolean>`
        ${accounts.expires_at} IS NOT NULL
        AND ${accounts.expires_at} < EXTRACT(EPOCH FROM NOW())
      `,
    })
    .from(accounts)
    .where(
      and(
        eq(accounts.userId, session.user.id),
        eq(accounts.provider, "google")
      )
    )
    .limit(1)
    .then((rows) => rows[0]);

  const isExpired = googleAccount?.isExpired ?? false;
  const rawStatus = googleAccount?.connectionStatus ?? "active";
  const status = isExpired ? "expired" : rawStatus;

  if (
    googleAccount &&
    isExpired &&
    googleAccount.connectionStatus !== "expired"
  ) {
    await db
      .update(accounts)
      .set({ connectionStatus: "expired" })
      .where(
        and(
          eq(accounts.userId, session.user.id),
          eq(accounts.provider, "google")
        )
      );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
        <p className="text-sm text-muted-foreground">
          Manage connected platforms for review sync.
        </p>
      </div>
      <GoogleConnectionCard
        isConnected={Boolean(googleAccount)}
        accountId={googleAccount?.providerAccountId}
        email={session.user.email}
        status={googleAccount ? status : null}
        lastAuthAt={googleAccount?.lastAuthAt?.toISOString() ?? null}
      />
    </div>
  );
}
