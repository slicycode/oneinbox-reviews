import { auth, signIn } from "@/auth";
import { db } from "@/db";
import { alertSettings } from "@/db/schema/alert-settings";
import { subscriptions } from "@/db/schema/subscriptions";
import { eq } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmailAlertsForm } from "@/features/alerts/email-alerts-form";
import { DEFAULT_NEGATIVE_REVIEW_THRESHOLD } from "@/lib/alerts/constants";
import { isActiveSubscription } from "@/lib/subscriptions/state-machine";

export default async function NotificationsSettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return signIn();
  }

  const alertSettingsRow = await db
    .select({
      emailAlertsEnabled: alertSettings.emailAlertsEnabled,
      negativeReviewThreshold: alertSettings.negativeReviewThreshold,
      alertsPaused: alertSettings.alertsPaused,
    })
    .from(alertSettings)
    .where(eq(alertSettings.userId, session.user.id))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  const subscriptionRow = await db
    .select({
      status: subscriptions.status,
    })
    .from(subscriptions)
    .where(eq(subscriptions.userId, session.user.id))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  const isFreePlan =
    !subscriptionRow || !isActiveSubscription(subscriptionRow.status);

  const emailAlertsEnabled = alertSettingsRow?.emailAlertsEnabled ?? false;
  const negativeReviewThreshold =
    alertSettingsRow?.negativeReviewThreshold ?? DEFAULT_NEGATIVE_REVIEW_THRESHOLD;
  const alertsPaused = alertSettingsRow?.alertsPaused ?? false;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Configure when and how you receive email alerts about your reviews.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmailAlertsForm
            initialEnabled={emailAlertsEnabled}
            initialThreshold={negativeReviewThreshold}
            initialPaused={alertsPaused}
            isFreePlan={isFreePlan}
          />
        </CardContent>
      </Card>
    </div>
  );
}
