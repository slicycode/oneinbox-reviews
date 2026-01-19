import { auth, signIn } from "@/auth";
import { db } from "@/db";
import { accounts, users } from "@/db/schema/user";
import { reviewSyncStatus } from "@/db/schema/review-sync-status";
import { eq, and, sql } from "drizzle-orm";
import { GoogleConnectionCard } from "@/features/integrations/google-connection-card";
import { canDisconnectGoogle } from "@/lib/auth/google-disconnect";
import {
  getGoogleOAuthErrorMessage,
  getGoogleSyncErrorGuidance,
  hasRequiredGoogleScopes,
  isGoogleAuthError,
  parseGoogleSyncStatus,
  resolveGoogleConnectionStatus,
  resolveGoogleSyncSummary,
} from "@/lib/auth/google-connection";

type IntegrationsPageProps = {
  searchParams?: Promise<{ error?: string | string[] }>;
};

export default async function IntegrationsPage({
  searchParams,
}: IntegrationsPageProps) {
  const resolvedSearchParams = searchParams
    ? await searchParams
    : undefined;
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
      scope: accounts.scope,
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

  const userAuthState = await db
    .select({
      password: users.password,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)
    .then((rows) => rows[0]);

  const connectedProviders = await db
    .select({
      provider: accounts.provider,
    })
    .from(accounts)
    .where(eq(accounts.userId, session.user.id));

  const canDisconnect = canDisconnectGoogle({
    hasPassword: Boolean(userAuthState?.password),
    providers: connectedProviders.map((account) => account.provider),
  });

  const syncStatus = await db
    .select({
      status: reviewSyncStatus.status,
      lastSuccessAt: reviewSyncStatus.lastSuccessAt,
      lastError: reviewSyncStatus.lastError,
    })
    .from(reviewSyncStatus)
    .where(
      and(
        eq(reviewSyncStatus.userId, session.user.id),
        eq(reviewSyncStatus.provider, "google")
      )
    )
    .limit(1)
    .then((rows) => rows[0]);

  const isExpired = googleAccount?.isExpired ?? false;
  const status = resolveGoogleConnectionStatus({
    connectionStatus: googleAccount?.connectionStatus ?? null,
    isExpired,
  });
  const missingScopes = googleAccount
    ? !hasRequiredGoogleScopes(googleAccount.scope ?? "")
    : false;
  const hasAuthError = isGoogleAuthError(syncStatus?.lastError ?? null);
  const effectiveStatus = hasAuthError ? "expired" : status;
  const errorMessage =
    getGoogleOAuthErrorMessage(resolvedSearchParams?.error) ??
    (missingScopes
      ? getGoogleOAuthErrorMessage("google_missing_scopes")
      : hasAuthError
        ? "Google connection expired. Please reconnect to resume syncing."
        : null);
  const syncErrorGuidance = getGoogleSyncErrorGuidance(
    syncStatus?.lastError ?? null
  );
  const syncSummary = resolveGoogleSyncSummary({
    isConnected: Boolean(googleAccount),
    syncStatus: parseGoogleSyncStatus(syncStatus?.status),
    lastSuccessAt: syncStatus?.lastSuccessAt ?? null,
  });
  const syncRequiresAction =
    syncSummary.requiresAction ||
    effectiveStatus !== "active" ||
    missingScopes;

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
        canDisconnect={canDisconnect}
        accountId={googleAccount?.providerAccountId}
        email={session.user.email}
        status={googleAccount ? effectiveStatus : null}
        lastAuthAt={googleAccount?.lastAuthAt?.toISOString() ?? null}
        errorMessage={errorMessage}
        lastSyncAt={syncStatus?.lastSuccessAt?.toISOString() ?? null}
        syncStatusLabel={syncSummary.label}
        syncRequiresAction={syncRequiresAction}
        syncError={syncStatus?.lastError ?? null}
        syncErrorGuidance={syncErrorGuidance}
        showReconnect={effectiveStatus !== "active" || missingScopes}
      />
    </div>
  );
}
