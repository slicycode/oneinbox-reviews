import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import withAuthRequired from "@/lib/auth/withAuthRequired";
import { db } from "@/db";
import { alertSettings } from "@/db/schema/alert-settings";
import { alertSettingsSchema } from "@/lib/validations/alert-settings.schema";

export const GET = withAuthRequired(async (_req, context) => {
  const settings = await db
    .select({
      emailAlertsEnabled: alertSettings.emailAlertsEnabled,
      negativeReviewThreshold: alertSettings.negativeReviewThreshold,
    })
    .from(alertSettings)
    .where(eq(alertSettings.userId, context.session.user.id))
    .limit(1)
    .then((rows) => rows[0]);

  return NextResponse.json({
    emailAlertsEnabled: settings?.emailAlertsEnabled ?? false,
    negativeReviewThreshold: settings?.negativeReviewThreshold ?? 2,
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
      { status: 400 }
    );
  }

  const now = new Date();
  const settings = await db
    .insert(alertSettings)
    .values({
      userId: context.session.user.id,
      emailAlertsEnabled: parsed.data.emailAlertsEnabled,
      negativeReviewThreshold: parsed.data.negativeReviewThreshold,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: alertSettings.userId,
      set: {
        emailAlertsEnabled: parsed.data.emailAlertsEnabled,
        negativeReviewThreshold: parsed.data.negativeReviewThreshold,
        updatedAt: now,
      },
    })
    .returning({
      emailAlertsEnabled: alertSettings.emailAlertsEnabled,
      negativeReviewThreshold: alertSettings.negativeReviewThreshold,
    })
    .then((rows) => rows[0]);

  return NextResponse.json({
    emailAlertsEnabled: settings.emailAlertsEnabled,
    negativeReviewThreshold: settings.negativeReviewThreshold,
  });
});
