import { db } from "@/db";
import { onboardingProgress } from "@/db/schema/onboarding";
import { reviews } from "@/db/schema/reviews";
import { alertSettings } from "@/db/schema/alert-settings";
import { accounts } from "@/db/schema/user";
import { eq, and, sql } from "drizzle-orm";

export interface OnboardingProgressData {
  connectGoogle: boolean;
  syncReviews: boolean;
  viewInbox: boolean;
  setupAlerts: boolean;
  dismissed: boolean;
}

/**
 * Get onboarding progress for a user by checking actual app state.
 * This ensures the checklist reflects real progress even if the user
 * completes steps without explicitly marking them.
 */
export async function getOnboardingProgress(
  userId: string
): Promise<OnboardingProgressData> {
  // Get stored onboarding progress
  const storedProgress = await db
    .select({
      connectGoogle: onboardingProgress.connectGoogle,
      syncReviews: onboardingProgress.syncReviews,
      viewInbox: onboardingProgress.viewInbox,
      setupAlerts: onboardingProgress.setupAlerts,
      dismissed: onboardingProgress.dismissed,
    })
    .from(onboardingProgress)
    .where(eq(onboardingProgress.userId, userId))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  // If dismissed, return early
  if (storedProgress?.dismissed) {
    return storedProgress;
  }

  // Check actual app state to auto-complete steps
  const [hasGoogleAccount, hasReviews, hasAlertSettings] = await Promise.all([
    // Check if user has connected Google
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(accounts)
      .where(and(eq(accounts.userId, userId), eq(accounts.provider, "google")))
      .then((rows) => (rows[0]?.count ?? 0) > 0),

    // Check if user has any reviews
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(reviews)
      .where(eq(reviews.userId, userId))
      .then((rows) => (rows[0]?.count ?? 0) > 0),

    // Check if user has set up alert settings with email enabled
    db
      .select({ emailAlertsEnabled: alertSettings.emailAlertsEnabled })
      .from(alertSettings)
      .where(eq(alertSettings.userId, userId))
      .limit(1)
      .then((rows) => rows[0]?.emailAlertsEnabled ?? false),
  ]);

  // Compute actual progress
  const progress: OnboardingProgressData = {
    connectGoogle: storedProgress?.connectGoogle || hasGoogleAccount,
    syncReviews: storedProgress?.syncReviews || hasReviews,
    viewInbox: storedProgress?.viewInbox || hasReviews, // Auto-complete if they have reviews
    setupAlerts: storedProgress?.setupAlerts || hasAlertSettings,
    dismissed: storedProgress?.dismissed ?? false,
  };

  // If progress differs from stored, update the database
  if (storedProgress) {
    const needsUpdate =
      progress.connectGoogle !== storedProgress.connectGoogle ||
      progress.syncReviews !== storedProgress.syncReviews ||
      progress.viewInbox !== storedProgress.viewInbox ||
      progress.setupAlerts !== storedProgress.setupAlerts;

    if (needsUpdate) {
      const allComplete =
        progress.connectGoogle &&
        progress.syncReviews &&
        progress.viewInbox &&
        progress.setupAlerts;

      await db
        .update(onboardingProgress)
        .set({
          ...progress,
          completedAt: allComplete ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(onboardingProgress.userId, userId));
    }
  } else {
    // Create initial record
    const allComplete =
      progress.connectGoogle &&
      progress.syncReviews &&
      progress.viewInbox &&
      progress.setupAlerts;

    await db.insert(onboardingProgress).values({
      userId,
      ...progress,
      completedAt: allComplete ? new Date() : null,
    });
  }

  return progress;
}
