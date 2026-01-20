import { render } from "@react-email/components";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { alertSettings } from "@/db/schema/alert-settings";
import { reviews } from "@/db/schema/reviews";
import { users } from "@/db/schema/user";
import { DEFAULT_NEGATIVE_REVIEW_THRESHOLD } from "@/lib/alerts/constants";
import { appConfig } from "@/lib/config";
import sendMail from "@/lib/email/sendMail";
import NewReviewAlert from "@/emails/NewReviewAlert";
import { canAccessFeature } from "@/lib/subscriptions/access-control";

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const sendNewReviewAlert = async (params: {
  userId: string;
  provider: string;
  insertedCount: number;
  since?: Date;
}) => {
  if (params.insertedCount <= 0) {
    return;
  }

  // Verify user has access to email alerts feature
  const hasFeatureAccess = await canAccessFeature(params.userId, "email_alerts");
  if (!hasFeatureAccess) {
    console.log(
      `[alerts] Skipping email alert for user ${params.userId}: no email_alerts feature access`
    );
    return;
  }

  const settings = await db
    .select({
      emailAlertsEnabled: alertSettings.emailAlertsEnabled,
      negativeReviewThreshold: alertSettings.negativeReviewThreshold,
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

  const createdSince = params.since ?? new Date(Date.now() - 10 * 60 * 1000);
  const threshold =
    settings.negativeReviewThreshold ?? DEFAULT_NEGATIVE_REVIEW_THRESHOLD;
  const reviewRows = await db
    .select({
      rating: reviews.rating,
      authorName: reviews.authorName,
      content: reviews.content,
      reviewUrl: reviews.reviewUrl,
      reviewCreatedAt: reviews.reviewCreatedAt,
    })
    .from(reviews)
    .where(
      and(
        eq(reviews.userId, params.userId),
        eq(reviews.provider, params.provider),
        gte(reviews.createdAt, createdSince),
        lte(reviews.rating, threshold)
      )
    )
    .orderBy(desc(reviews.createdAt))
    .limit(Math.min(params.insertedCount, 5));

  if (reviewRows.length === 0) {
    return;
  }

  const inboxUrl = `${getBaseUrl()}/app/inbox`;
  const html = await render(
    NewReviewAlert({
      userName: user.name ?? "there",
      reviews: reviewRows.map((row) => ({
        ...row,
        reviewCreatedAt: row.reviewCreatedAt.toISOString(),
      })),
      totalNew: reviewRows.length,
      inboxUrl,
    })
  );

  const subject = `${reviewRows.length} new review${
    reviewRows.length === 1 ? "" : "s"
  } on ${appConfig.projectName}`;

  await sendMail(user.email, subject, html);
};
