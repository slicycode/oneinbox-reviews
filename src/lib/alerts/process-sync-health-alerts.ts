import { render } from "@react-email/components";
import { and, eq, or, sql, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { alertSettings } from "@/db/schema/alert-settings";
import { reviewSyncStatus } from "@/db/schema/review-sync-status";
import { users } from "@/db/schema/user";
import SyncHealthAlert from "@/emails/SyncHealthAlert";
import sendMail from "@/lib/email/sendMail";
import { appConfig } from "@/lib/config";

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const ALERT_COOLDOWN_HOURS = 24;

export const processSyncHealthAlerts = async () => {
  const staleExpr = sql<boolean>`
    ${reviewSyncStatus.lastSuccessAt} IS NULL
    OR ${reviewSyncStatus.lastSuccessAt} < NOW() - (${appConfig.sync.staleHours} * INTERVAL '1 hour')
  `;

  const rows = await db
    .select({
      id: reviewSyncStatus.id,
      userId: reviewSyncStatus.userId,
      provider: reviewSyncStatus.provider,
      status: reviewSyncStatus.status,
      lastAttemptAt: reviewSyncStatus.lastAttemptAt,
      lastSuccessAt: reviewSyncStatus.lastSuccessAt,
      lastAlertAt: reviewSyncStatus.lastAlertAt,
      lastAlertStatus: reviewSyncStatus.lastAlertStatus,
      isStale: staleExpr,
      email: users.email,
      name: users.name,
      emailAlertsEnabled: alertSettings.emailAlertsEnabled,
      alertsPaused: alertSettings.alertsPaused,
    })
    .from(reviewSyncStatus)
    .leftJoin(users, eq(users.id, reviewSyncStatus.userId))
    .leftJoin(alertSettings, eq(alertSettings.userId, reviewSyncStatus.userId))
    .where(
      and(
        or(eq(reviewSyncStatus.status, "failed"), staleExpr),
        isNotNull(alertSettings.userId),
        eq(alertSettings.emailAlertsEnabled, true),
        eq(alertSettings.alertsPaused, false)
      )
    );

  const now = new Date();
  let sent = 0;

  for (const row of rows) {
    if (!row.email) {
      continue;
    }

    if (!row.lastSuccessAt && row.status !== "failed") {
      continue;
    }

    const alertStatus = row.status === "failed" ? "failed" : "stale";
    if (row.lastAlertAt && row.lastAlertStatus === alertStatus) {
      const hoursSince =
        (now.getTime() - row.lastAlertAt.getTime()) / (1000 * 60 * 60);
      if (hoursSince < ALERT_COOLDOWN_HOURS) {
        continue;
      }
    }

    const html = await render(
      SyncHealthAlert({
        userName: row.name ?? "there",
        status: alertStatus,
        provider: row.provider,
        lastAttemptAt: row.lastAttemptAt
          ? row.lastAttemptAt.toISOString()
          : null,
        lastSuccessAt: row.lastSuccessAt
          ? row.lastSuccessAt.toISOString()
          : null,
        inboxUrl: `${getBaseUrl()}/app/inbox`,
      })
    );

    await sendMail(
      row.email,
      `${row.provider} review sync ${alertStatus}`,
      html
    );

    await db
      .update(reviewSyncStatus)
      .set({
        lastAlertAt: now,
        lastAlertStatus: alertStatus,
        updatedAt: now,
      })
      .where(eq(reviewSyncStatus.id, row.id));

    sent += 1;
  }

  return { processed: rows.length, sent };
};
