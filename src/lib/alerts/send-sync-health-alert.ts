import { render } from "@react-email/components";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { alertSettings } from "@/db/schema/alert-settings";
import { reviewSyncStatus } from "@/db/schema/review-sync-status";
import { users } from "@/db/schema/user";
import sendMail from "@/lib/email/sendMail";
import SyncHealthAlert from "@/emails/SyncHealthAlert";

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const sendSyncHealthAlert = async (params: {
  userId: string;
  provider: string;
  status: "failed" | "stale";
}) => {
  const settings = await db
    .select({
      emailAlertsEnabled: alertSettings.emailAlertsEnabled,
      alertsPaused: alertSettings.alertsPaused,
    })
    .from(alertSettings)
    .where(eq(alertSettings.userId, params.userId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!settings?.emailAlertsEnabled || settings.alertsPaused) {
    return;
  }

  const user = await db
    .select({ email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, params.userId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!user?.email) {
    return;
  }

  const syncStatus = await db
    .select({
      lastAttemptAt: reviewSyncStatus.lastAttemptAt,
      lastSuccessAt: reviewSyncStatus.lastSuccessAt,
      status: reviewSyncStatus.status,
    })
    .from(reviewSyncStatus)
    .where(
      and(
        eq(reviewSyncStatus.userId, params.userId),
        eq(reviewSyncStatus.provider, params.provider)
      )
    )
    .limit(1)
    .then((rows) => rows[0]);

  if (!syncStatus) {
    return;
  }

  const html = await render(
    SyncHealthAlert({
      userName: user.name ?? "there",
      status: params.status,
      provider: params.provider,
      lastAttemptAt: syncStatus.lastAttemptAt
        ? syncStatus.lastAttemptAt.toISOString()
        : null,
      lastSuccessAt: syncStatus.lastSuccessAt
        ? syncStatus.lastSuccessAt.toISOString()
        : null,
      inboxUrl: `${getBaseUrl()}/app/inbox`,
    })
  );

  await sendMail(
    user.email,
    `${params.provider} review sync ${params.status}`,
    html
  );
};
