import { NextResponse } from "next/server";
import withAuthRequired from "@/lib/auth/withAuthRequired";
import { db } from "@/db";
import { users, accounts } from "@/db/schema/user";
import { reviews } from "@/db/schema/reviews";
import { subscriptions } from "@/db/schema/subscriptions";
import { alertSettings } from "@/db/schema/alert-settings";
import { reviewSyncStatus } from "@/db/schema/review-sync-status";
import { billingProfiles } from "@/db/schema/billing-profile";
import { eq } from "drizzle-orm";

/**
 * GDPR Data Export Endpoint
 * Allows users to download all their personal data (Right to Data Portability)
 */
export const GET = withAuthRequired(async (req, context) => {
  const { session } = context;
  const userId = session.user.id;

  // Fetch all user data in parallel
  const [
    userData,
    userAccounts,
    userReviews,
    userSubscription,
    userAlertSettings,
    userSyncStatus,
    userBillingProfile,
  ] = await Promise.all([
    // User profile
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        emailVerified: users.emailVerified,
        image: users.image,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .then((rows) => rows[0] ?? null),

    // Connected accounts (without sensitive tokens)
    db
      .select({
        provider: accounts.provider,
        type: accounts.type,
        connectionStatus: accounts.connectionStatus,
        lastAuthAt: accounts.lastAuthAt,
      })
      .from(accounts)
      .where(eq(accounts.userId, userId)),

    // All reviews
    db
      .select({
        id: reviews.id,
        provider: reviews.provider,
        status: reviews.status,
        rating: reviews.rating,
        content: reviews.content,
        authorName: reviews.authorName,
        authorUrl: reviews.authorUrl,
        reviewUrl: reviews.reviewUrl,
        locationName: reviews.locationName,
        reviewCreatedAt: reviews.reviewCreatedAt,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .where(eq(reviews.userId, userId)),

    // Subscription
    db
      .select({
        status: subscriptions.status,
        planTier: subscriptions.planTier,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
        trialStart: subscriptions.trialStart,
        trialEnd: subscriptions.trialEnd,
        createdAt: subscriptions.createdAt,
      })
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .then((rows) => rows[0] ?? null),

    // Alert settings
    db
      .select({
        emailAlertsEnabled: alertSettings.emailAlertsEnabled,
        negativeReviewThreshold: alertSettings.negativeReviewThreshold,
        alertsPaused: alertSettings.alertsPaused,
        notificationFrequency: alertSettings.notificationFrequency,
        notifyOnAllReviews: alertSettings.notifyOnAllReviews,
        quietHoursEnabled: alertSettings.quietHoursEnabled,
        quietHoursStart: alertSettings.quietHoursStart,
        quietHoursEnd: alertSettings.quietHoursEnd,
        createdAt: alertSettings.createdAt,
      })
      .from(alertSettings)
      .where(eq(alertSettings.userId, userId))
      .then((rows) => rows[0] ?? null),

    // Sync status
    db
      .select({
        provider: reviewSyncStatus.provider,
        status: reviewSyncStatus.status,
        lastSuccessAt: reviewSyncStatus.lastSuccessAt,
        createdAt: reviewSyncStatus.createdAt,
      })
      .from(reviewSyncStatus)
      .where(eq(reviewSyncStatus.userId, userId)),

    // Billing profile
    db
      .select({
        country: billingProfiles.country,
        state: billingProfiles.state,
        city: billingProfiles.city,
        street: billingProfiles.street,
        zipcode: billingProfiles.zipcode,
        isBusinessCustomer: billingProfiles.isBusinessCustomer,
        taxId: billingProfiles.taxId,
        createdAt: billingProfiles.createdAt,
      })
      .from(billingProfiles)
      .where(eq(billingProfiles.userId, userId))
      .then((rows) => rows[0] ?? null),
  ]);

  // Compile export data
  const exportData = {
    exportDate: new Date().toISOString(),
    exportVersion: "1.0",
    profile: userData,
    connectedAccounts: userAccounts,
    subscription: userSubscription,
    alertSettings: userAlertSettings,
    syncStatus: userSyncStatus,
    billingProfiles: userBillingProfile,
    reviews: userReviews,
    metadata: {
      totalReviews: userReviews.length,
      accountCreated: userData?.createdAt?.toISOString() ?? null,
    },
  };

  // Return as downloadable JSON file
  const jsonString = JSON.stringify(exportData, null, 2);

  return new NextResponse(jsonString, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="oneinbox-data-export-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
});
