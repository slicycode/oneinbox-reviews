import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { accounts } from "@/db/schema/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { and, eq, sql } from "drizzle-orm";
import { getAppEntryContent } from "@/lib/app-entry";
import { ConnectGoogleButton } from "../../../features/integrations/connect-google-button";
import Link from "next/link";

export default async function AppHomepage() {
  const session = await auth();

  if (!session?.user?.id) {
    return signIn();
  }

  const googleAccount = await db
    .select({
      connectionStatus: accounts.connectionStatus,
      isExpired: sql<boolean>`
        ${accounts.expires_at} IS NOT NULL
        AND ${accounts.expires_at} < EXTRACT(EPOCH FROM NOW())
      `,
    })
    .from(accounts)
    .where(
      and(
        eq(accounts.userId, session.user.id),
        eq(accounts.provider, "google"),
      ),
    )
    .limit(1)
    .then((rows) => rows[0] ?? null);

  const isConnected =
    Boolean(googleAccount) &&
    googleAccount?.connectionStatus === "active" &&
    !googleAccount?.isExpired;

  if (isConnected) {
    redirect("/app/dashboard");
  }

  const content = getAppEntryContent();

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-10">
      <Card className="w-full max-w-2xl">
        <CardHeader className="gap-2">
          <CardTitle className="text-2xl">{content.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{content.description}</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">{content.helper}</p>
          <ConnectGoogleButton label={content.ctaLabel} />
          <p className="text-xs text-muted-foreground">
            Already connected?{" "}
            <Link className="underline" href="/app/inbox">
              Go to inbox
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
