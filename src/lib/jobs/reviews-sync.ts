import { db } from "@/db";
import { reviewSyncJobs } from "@/db/schema/review-sync-job";
import { reviewSyncStatus } from "@/db/schema/review-sync-status";
import { accounts } from "@/db/schema/user";
import { reviews } from "@/db/schema/reviews";
import { sendNewReviewAlert } from "@/lib/alerts/send-new-review-alert";
import { and, eq } from "drizzle-orm";

const GOOGLE_ACCOUNT_API_BASE =
  "https://mybusinessaccountmanagement.googleapis.com/v1";
const GOOGLE_BUSINESS_INFO_API_BASE =
  "https://mybusinessbusinessinformation.googleapis.com/v1";
const GOOGLE_REVIEWS_API_BASE = "https://mybusiness.googleapis.com/v4";

type ReviewSyncJob = {
  id: string;
  userId: string;
  provider: string;
  jobType: "initial" | "backfill" | "manual";
  status: string;
  requestedAt: string;
  event: "review.sync.queued";
};

type GoogleAccountList = {
  accounts?: Array<{
    name?: string;
    accountName?: string;
  }>;
};

type GoogleLocationList = {
  locations?: Array<{
    name?: string;
    title?: string;
    metadata?: {
      placeId?: string;
    };
  }>;
};

type GoogleReviewList = {
  reviews?: Array<{
    name?: string;
    reviewId?: string;
    comment?: string;
    starRating?: string;
    createTime?: string;
    updateTime?: string;
    reviewer?: {
      displayName?: string;
      profilePhotoUrl?: string;
    };
  }>;
};

const fetchGoogleApi = async <T>(
  url: string,
  accessToken: string
): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(errorText || "Google API request failed");
  }

  return (await response.json()) as T;
};

export const mapGoogleStarRating = (
  starRating?: string | null
): number | null => {
  switch (starRating) {
    case "FIVE":
      return 5;
    case "FOUR":
      return 4;
    case "THREE":
      return 3;
    case "TWO":
      return 2;
    case "ONE":
      return 1;
    default:
      return null;
  }
};

type GoogleReview = NonNullable<GoogleReviewList["reviews"]>[number];

export const buildGoogleReviewRecord = (params: {
  userId: string;
  locationName?: string | null;
  placeId?: string | null;
  review: GoogleReview;
  now: Date;
}) => {
  const providerReviewId = params.review.reviewId ?? params.review.name;
  const rating = mapGoogleStarRating(params.review.starRating ?? null);

  if (!providerReviewId || !rating) {
    return null;
  }

  const rawCreatedAt =
    params.review.createTime ?? params.review.updateTime ?? null;
  const createdAt = rawCreatedAt ? new Date(rawCreatedAt) : params.now;
  const reviewCreatedAt = Number.isNaN(createdAt.getTime())
    ? params.now
    : createdAt;
  const content =
    params.review.comment?.trim() || "No written comment provided.";
  const reviewUrl = params.placeId
    ? `https://search.google.com/local/reviews?placeid=${params.placeId}`
    : null;

  return {
    userId: params.userId,
    provider: "google",
    providerReviewId,
    status: "unread" as const,
    rating,
    content,
    authorName: params.review.reviewer?.displayName ?? null,
    authorUrl: null,
    reviewUrl,
    replyUrl: null,
    locationName: params.locationName ?? null,
    reviewCreatedAt,
    createdAt: params.now,
    updatedAt: params.now,
  };
};

export const enqueueReviewSync = async (
  userId: string,
  provider: string,
  jobType: "initial" | "backfill" | "manual",
  providerAccountId?: string
): Promise<ReviewSyncJob> => {
  const now = new Date();
  const idempotencyKey = `${userId}:${provider}:${providerAccountId ?? "unknown"}:${jobType}`;

  const job = await db
    .insert(reviewSyncJobs)
    .values({
      userId,
      provider,
      jobType,
      status: "pending",
      idempotencyKey,
      requestedAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: reviewSyncJobs.idempotencyKey,
      set: {
        status: "pending",
        requestedAt: now,
        updatedAt: now,
        error: null,
      },
    })
    .returning()
    .then((rows) => rows[0]);

  const payload: ReviewSyncJob = {
    id: job.id,
    userId: job.userId,
    provider: job.provider,
    jobType,
    status: job.status,
    requestedAt: job.requestedAt.toISOString(),
    event: "review.sync.queued",
  };

  console.log(
    JSON.stringify({ level: "info", event: payload.event, context: payload })
  );

  return payload;
};

const ingestGoogleReviews = async (userId: string) => {
  const googleAccount = await db
    .select({ providerAccountId: accounts.providerAccountId })
    .from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.provider, "google")))
    .limit(1)
    .then((rows) => rows[0]);

  if (!googleAccount) {
    return 0;
  }

  const accessToken = await db
    .select({
      accessToken: accounts.access_token,
      expiresAt: accounts.expires_at,
    })
    .from(accounts)
    .where(
      and(
        eq(accounts.userId, userId),
        eq(accounts.provider, "google"),
        eq(accounts.providerAccountId, googleAccount.providerAccountId)
      )
    )
    .limit(1)
    .then((rows) => rows[0]);

  if (!accessToken?.accessToken) {
    throw new Error("Google access token missing. Reconnect to sync reviews.");
  }

  if (accessToken.expiresAt && accessToken.expiresAt * 1000 < Date.now()) {
    throw new Error("Google access token expired. Reconnect to sync reviews.");
  }

  const accountList = await fetchGoogleApi<GoogleAccountList>(
    `${GOOGLE_ACCOUNT_API_BASE}/accounts`,
    accessToken.accessToken
  );
  const account = accountList.accounts?.[0];

  if (!account?.name) {
    return 0;
  }

  const locationList = await fetchGoogleApi<GoogleLocationList>(
    `${GOOGLE_BUSINESS_INFO_API_BASE}/${account.name}/locations?readMask=name,title,metadata`,
    accessToken.accessToken
  );
  const location = locationList.locations?.[0];

  if (!location?.name) {
    return 0;
  }

  const reviewList = await fetchGoogleApi<GoogleReviewList>(
    `${GOOGLE_REVIEWS_API_BASE}/${location.name}/reviews`,
    accessToken.accessToken
  );

  const now = new Date();
  const reviewValues = (reviewList.reviews ?? [])
    .map((review) =>
      buildGoogleReviewRecord({
        userId,
        locationName: location.title ?? null,
        placeId: location.metadata?.placeId ?? null,
        review,
        now,
      })
    )
    .filter((value): value is NonNullable<typeof value> => Boolean(value));

  if (reviewValues.length === 0) {
    return 0;
  }

  const inserted = await db
    .insert(reviews)
    .values(reviewValues)
    .onConflictDoNothing({
      target: [reviews.userId, reviews.provider, reviews.providerReviewId],
    })
    .returning({ id: reviews.id });

  return inserted.length;
};

const upsertSyncStatus = async (params: {
  userId: string;
  provider: string;
  status: "active" | "failed" | "stale";
  lastSuccessAt?: Date | null;
  lastAttemptAt: Date;
  lastError?: string | null;
}) => {
  const now = params.lastAttemptAt;
  await db
    .insert(reviewSyncStatus)
    .values({
      userId: params.userId,
      provider: params.provider,
      status: params.status,
      lastSuccessAt: params.lastSuccessAt ?? null,
      lastAttemptAt: params.lastAttemptAt,
      lastError: params.lastError ?? null,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [reviewSyncStatus.userId, reviewSyncStatus.provider],
      set: {
        status: params.status,
        lastSuccessAt: params.lastSuccessAt ?? null,
        lastAttemptAt: params.lastAttemptAt,
        lastError: params.lastError ?? null,
        updatedAt: now,
      },
    });
};

export const processReviewSyncJobs = async (options?: { userId?: string }) => {
  const whereClause = options?.userId
    ? and(
        eq(reviewSyncJobs.status, "pending"),
        eq(reviewSyncJobs.userId, options.userId)
      )
    : eq(reviewSyncJobs.status, "pending");
  const pendingJobs = await db
    .select()
    .from(reviewSyncJobs)
    .where(whereClause);

  if (pendingJobs.length === 0) {
    return {
      processed: 0,
      inserted: 0,
    };
  }

  let processed = 0;
  let inserted = 0;
  for (const job of pendingJobs) {
    const jobStartedAt = new Date();
    processed += 1;
    await db
      .update(reviewSyncJobs)
      .set({ status: "processing", updatedAt: jobStartedAt })
      .where(eq(reviewSyncJobs.id, job.id));

    try {
      let insertedCount = 0;
      if (job.provider === "google") {
        insertedCount = await ingestGoogleReviews(job.userId);
      }

      inserted += insertedCount;
      if (insertedCount > 0) {
        void sendNewReviewAlert({
          userId: job.userId,
          provider: job.provider,
          insertedCount,
          since: jobStartedAt,
        }).catch((error) => {
          console.error("Failed to send review alert:", error);
        });
      }

      const nextStatus = "active";
      const lastSuccessAt = jobStartedAt;

      await db
        .update(reviewSyncJobs)
        .set({
          status: "processed",
          processedAt: jobStartedAt,
          updatedAt: jobStartedAt,
        })
        .where(eq(reviewSyncJobs.id, job.id));

      await upsertSyncStatus({
        userId: job.userId,
        provider: job.provider,
        status: nextStatus,
        lastSuccessAt,
        lastAttemptAt: jobStartedAt,
      });

    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      await db
        .update(reviewSyncJobs)
        .set({
          status: "error",
          error: message,
          updatedAt: jobStartedAt,
        })
        .where(eq(reviewSyncJobs.id, job.id));

      await upsertSyncStatus({
        userId: job.userId,
        provider: job.provider,
        status: "failed",
        lastAttemptAt: jobStartedAt,
        lastError: message,
      });

    }
  }

  return { processed, inserted };
};
