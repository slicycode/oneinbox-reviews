import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import withAuthRequired from "@/lib/auth/withAuthRequired";
import { db } from "@/db";
import { alertSettings } from "@/db/schema/alert-settings";
import { enforceFeatureAccess } from "@/lib/subscriptions/api-enforcement";
import sendMail from "@/lib/email/sendMail";
import { appConfig } from "@/lib/config";

export const POST = withAuthRequired(async (_req, context) => {
  // Check feature access
  const enforcementError = await enforceFeatureAccess(
    context.session.user.id,
    "email_alerts",
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
          message:
            "Email alerts are not enabled. Enable them first to send a test.",
        },
      },
      { status: 400 },
    );
  }

  if (settings?.alertsPaused) {
    return NextResponse.json(
      {
        error: {
          code: "alerts_paused",
          message:
            "Alerts are currently paused. Unpause them first to send a test.",
        },
      },
      { status: 400 },
    );
  }

  // Send actual test notification email
  const user = await context.getUser();
  const userEmail = context.session.user.email;
  const userName = user?.name || "there";

  const subject = `Test Notification from ${appConfig.projectName}`;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">${appConfig.projectName}</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">Hi ${userName},</h2>
    <p>This is a test notification from ${appConfig.projectName}.</p>
    <p>If you received this email, your email alerts are working correctly! You will receive notifications when:</p>
    <ul style="color: #555;">
      <li>New reviews are synced to your inbox</li>
      <li>Negative reviews require your attention</li>
      <li>Important updates about your business profiles</li>
    </ul>
    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #666; font-size: 14px;">
        <strong>Note:</strong> You can customize your notification preferences in your account settings.
      </p>
    </div>
    <p style="color: #888; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      This is an automated test notification. If you did not request this, you can safely ignore it.
    </p>
  </div>
</body>
</html>
  `.trim();

  try {
    await sendMail(userEmail, subject, html);
  } catch (error) {
    console.error("Failed to send test notification email:", error);
    return NextResponse.json(
      {
        error: {
          code: "email_send_failed",
          message: "Failed to send test notification. Please try again later.",
        },
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    message: "Test notification sent successfully. Check your inbox.",
  });
});
