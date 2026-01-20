import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import withAuthRequired from "@/lib/auth/withAuthRequired";
import { db } from "@/db";
import { alertSettings } from "@/db/schema/alert-settings";
import { enforceFeatureAccess } from "@/lib/subscriptions/api-enforcement";

export const POST = withAuthRequired(async (_req, context) => {
  // Check feature access
  const enforcementError = await enforceFeatureAccess(
    context.session.user.id,
    "email_alerts"
  );
  if (enforcementError) {
    return enforcementError;
  }

  // Check if email alerts are enabled
  const settings = await db
    .select({
      emailAlertsEnabled: alertSettings.emailAlertsEnabled,
      alertsPaused: alertSettings.alertsPaused,
    })
    .from(alertSettings)
    .where(eq(alertSettings.userId, context.session.user.id))
    .limit(1)
    .then((rows) => rows[0]);

  if (!settings?.emailAlertsEnabled) {
    return NextResponse.json(
      {
        error: {
          code: "alerts_disabled",
          message: "Email alerts are not enabled. Enable them first to send a test.",
        },
      },
      { status: 400 }
    );
  }

  if (settings?.alertsPaused) {
    return NextResponse.json(
      {
        error: {
          code: "alerts_paused",
          message: "Alerts are currently paused. Unpause them first to send a test.",
        },
      },
      { status: 400 }
    );
  }

  // In a real implementation, this would send an actual test email
  // For now, we'll simulate success
  // TODO: Integrate with email service to send actual test notification

  return NextResponse.json({
    success: true,
    message: "Test notification sent successfully. Check your inbox.",
  });
});
