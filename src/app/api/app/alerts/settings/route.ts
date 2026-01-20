import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import withAuthRequired from "@/lib/auth/withAuthRequired";
import { db } from "@/db";
import { alertSettings } from "@/db/schema/alert-settings";
import { DEFAULT_NEGATIVE_REVIEW_THRESHOLD } from "@/lib/alerts/constants";
import { alertSettingsSchema } from "@/lib/validations/alert-settings.schema";
import { enforceFeatureAccess } from "@/lib/subscriptions/api-enforcement";

export const GET = withAuthRequired(async (_req, context) => {
  const settings = await db
    .select({
      emailAlertsEnabled: alertSettings.emailAlertsEnabled,
      negativeReviewThreshold: alertSettings.negativeReviewThreshold,
      alertsPaused: alertSettings.alertsPaused,
      notificationFrequency: alertSettings.notificationFrequency,
      notifyOnAllReviews: alertSettings.notifyOnAllReviews,
      quietHoursEnabled: alertSettings.quietHoursEnabled,
      quietHoursStart: alertSettings.quietHoursStart,
      quietHoursEnd: alertSettings.quietHoursEnd,
    })
    .from(alertSettings)
    .where(eq(alertSettings.userId, context.session.user.id))
    .limit(1)
    .then((rows) => rows[0]);

  return NextResponse.json({
    emailAlertsEnabled: settings?.emailAlertsEnabled ?? false,
    negativeReviewThreshold:
      settings?.negativeReviewThreshold ?? DEFAULT_NEGATIVE_REVIEW_THRESHOLD,
    alertsPaused: settings?.alertsPaused ?? false,
    notificationFrequency: settings?.notificationFrequency ?? "immediate",
    notifyOnAllReviews: settings?.notifyOnAllReviews ?? false,
    quietHoursEnabled: settings?.quietHoursEnabled ?? false,
    quietHoursStart: settings?.quietHoursStart ?? "22:00",
    quietHoursEnd: settings?.quietHoursEnd ?? "08:00",
  });
});

export const PUT = withAuthRequired(async (req, context) => {
  const payload = await req.json().catch(() => null);
  const parsed = alertSettingsSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_payload",
          message: "Invalid alert settings payload",
        },
      },
      { status: 400 },
    );
  }

  // Check if user is trying to enable email alerts without feature access
  if (parsed.data.emailAlertsEnabled) {
    const enforcementError = await enforceFeatureAccess(
      context.session.user.id,
      "email_alerts",
    );
    if (enforcementError) {
      return enforcementError;
    }
  }

  const now = new Date();

  const settings = await db
    .insert(alertSettings)
    .values({
      userId: context.session.user.id,
      emailAlertsEnabled: parsed.data.emailAlertsEnabled,
      negativeReviewThreshold: parsed.data.negativeReviewThreshold,
      alertsPaused: parsed.data.alertsPaused,
      notificationFrequency: parsed.data.notificationFrequency ?? "immediate",
      notifyOnAllReviews: parsed.data.notifyOnAllReviews ?? false,
      quietHoursEnabled: parsed.data.quietHoursEnabled ?? false,
      quietHoursStart: parsed.data.quietHoursStart ?? "22:00",
      quietHoursEnd: parsed.data.quietHoursEnd ?? "08:00",
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: alertSettings.userId,
      set: {
        emailAlertsEnabled: parsed.data.emailAlertsEnabled,
        negativeReviewThreshold: parsed.data.negativeReviewThreshold,
        alertsPaused: parsed.data.alertsPaused,
        notificationFrequency: parsed.data.notificationFrequency ?? "immediate",
        notifyOnAllReviews: parsed.data.notifyOnAllReviews ?? false,
        quietHoursEnabled: parsed.data.quietHoursEnabled ?? false,
        quietHoursStart: parsed.data.quietHoursStart ?? "22:00",
        quietHoursEnd: parsed.data.quietHoursEnd ?? "08:00",
        updatedAt: now,
      },
    })
    .returning({
      emailAlertsEnabled: alertSettings.emailAlertsEnabled,
      negativeReviewThreshold: alertSettings.negativeReviewThreshold,
      alertsPaused: alertSettings.alertsPaused,
      notificationFrequency: alertSettings.notificationFrequency,
      notifyOnAllReviews: alertSettings.notifyOnAllReviews,
      quietHoursEnabled: alertSettings.quietHoursEnabled,
      quietHoursStart: alertSettings.quietHoursStart,
      quietHoursEnd: alertSettings.quietHoursEnd,
    })
    .then((rows) => rows[0]);

  return NextResponse.json({
    emailAlertsEnabled: settings.emailAlertsEnabled,
    negativeReviewThreshold: settings.negativeReviewThreshold,
    alertsPaused: settings.alertsPaused,
    notificationFrequency: settings.notificationFrequency,
    notifyOnAllReviews: settings.notifyOnAllReviews,
    quietHoursEnabled: settings.quietHoursEnabled,
    quietHoursStart: settings.quietHoursStart,
    quietHoursEnd: settings.quietHoursEnd,
  });
});
