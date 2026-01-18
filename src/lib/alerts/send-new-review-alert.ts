import { render } from "@react-email/components";
import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { alertSettings } from "@/db/schema/alert-settings";
import { reviews } from "@/db/schema/reviews";
import { users } from "@/db/schema/user";
import { appConfig } from "@/lib/config";
import sendMail from "@/lib/email/sendMail";
import NewReviewAlert from "@/emails/NewReviewAlert";

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

  const settings = await db
    .select({ emailAlertsEnabled: alertSettings.emailAlertsEnabled })
    .from(alertSettings)
    .where(eq(alertSettings.userId, params.userId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!settings?.emailAlertsEnabled) {
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
        gte(reviews.createdAt, createdSince)
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
      totalNew: params.insertedCount,
      inboxUrl,
    })
  );

  const subject = `${params.insertedCount} new review${
    params.insertedCount === 1 ? "" : "s"
  } on ${appConfig.projectName}`;

  await sendMail(user.email, subject, html);
};
