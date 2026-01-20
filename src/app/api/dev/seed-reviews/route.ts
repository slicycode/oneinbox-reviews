import { NextResponse } from "next/server";
import { eq, and, like } from "drizzle-orm";
import { db } from "@/db";
import { reviews } from "@/db/schema/reviews";
import withAuthRequired from "@/lib/auth/withAuthRequired";

const seedReviews = [
  // 5-star reviews
  {
    provider: "google",
    providerReviewId: "seed_review_001",
    status: "unread" as const,
    rating: 5,
    content:
      "Absolutely fantastic service! The team went above and beyond to help us. Would highly recommend to anyone looking for quality work.",
    authorName: "Sarah Johnson",
    locationName: "Main Street Location",
    daysAgo: 2,
  },
  {
    provider: "google",
    providerReviewId: "seed_review_002",
    status: "responded" as const,
    rating: 5,
    content:
      "Best experience I've ever had. Professional, efficient, and friendly staff. Will definitely be coming back!",
    authorName: "Michael Chen",
    locationName: "Main Street Location",
    daysAgo: 5,
  },
  {
    provider: "google",
    providerReviewId: "seed_review_003",
    status: "unread" as const,
    rating: 5,
    content:
      "Outstanding! They really know what they're doing. The attention to detail was impressive.",
    authorName: "Emily Rodriguez",
    locationName: "Downtown Branch",
    daysAgo: 1,
  },
  // 4-star reviews
  {
    provider: "google",
    providerReviewId: "seed_review_004",
    status: "unread" as const,
    rating: 4,
    content:
      "Great service overall. Minor wait time but the quality made up for it. Would recommend.",
    authorName: "David Thompson",
    locationName: "Main Street Location",
    daysAgo: 3,
  },
  {
    provider: "google",
    providerReviewId: "seed_review_005",
    status: "needs_follow_up" as const,
    rating: 4,
    content:
      "Good experience. Staff was helpful and knowledgeable. Just wish the hours were more flexible.",
    authorName: "Jessica Williams",
    locationName: "Downtown Branch",
    daysAgo: 7,
  },
  {
    provider: "google",
    providerReviewId: "seed_review_006",
    status: "responded" as const,
    rating: 4,
    content:
      "Very satisfied with the results. Communication could be slightly better but overall a positive experience.",
    authorName: "Robert Martinez",
    locationName: "Main Street Location",
    daysAgo: 10,
  },
  // 3-star reviews
  {
    provider: "google",
    providerReviewId: "seed_review_007",
    status: "needs_follow_up" as const,
    rating: 3,
    content:
      "Average experience. Nothing special but nothing terrible either. Service was okay.",
    authorName: "Amanda Foster",
    locationName: "Downtown Branch",
    daysAgo: 4,
  },
  {
    provider: "google",
    providerReviewId: "seed_review_008",
    status: "unread" as const,
    rating: 3,
    content:
      "It was fine. Met my basic expectations. Might try again to see if it improves.",
    authorName: "Christopher Lee",
    locationName: "Main Street Location",
    daysAgo: 8,
  },
  // 2-star reviews
  {
    provider: "google",
    providerReviewId: "seed_review_009",
    status: "needs_follow_up" as const,
    rating: 2,
    content:
      "Disappointed with the service. Long wait times and staff seemed disorganized. Expected better.",
    authorName: "Jennifer Brown",
    locationName: "Downtown Branch",
    daysAgo: 6,
  },
  {
    provider: "google",
    providerReviewId: "seed_review_010",
    status: "unread" as const,
    rating: 2,
    content:
      "Not great. Had some issues that weren't resolved properly. Hoping management addresses this.",
    authorName: "Mark Wilson",
    locationName: "Main Street Location",
    daysAgo: 9,
  },
  // 1-star review
  {
    provider: "google",
    providerReviewId: "seed_review_011",
    status: "needs_follow_up" as const,
    rating: 1,
    content:
      "Very poor experience. Would not recommend. Management needs to seriously improve their operations.",
    authorName: "Patricia Davis",
    locationName: "Downtown Branch",
    daysAgo: 12,
  },
  // Recent 5-star reviews (for "This Week" stats)
  {
    provider: "google",
    providerReviewId: "seed_review_012",
    status: "unread" as const,
    rating: 5,
    content:
      "Incredible! Just visited yesterday and was blown away by the service. The team is top-notch!",
    authorName: "Andrew Taylor",
    locationName: "Main Street Location",
    daysAgo: 1,
  },
  {
    provider: "google",
    providerReviewId: "seed_review_013",
    status: "unread" as const,
    rating: 5,
    content:
      "Perfect in every way. This is how businesses should operate. Thank you!",
    authorName: "Lisa Anderson",
    locationName: "Downtown Branch",
    daysAgo: 0,
  },
  // Older reviews (for trend comparison)
  {
    provider: "google",
    providerReviewId: "seed_review_014",
    status: "responded" as const,
    rating: 4,
    content:
      "Had a good experience two weeks ago. Solid service and fair pricing.",
    authorName: "Kevin Moore",
    locationName: "Main Street Location",
    daysAgo: 14,
  },
  {
    provider: "google",
    providerReviewId: "seed_review_015",
    status: "responded" as const,
    rating: 5,
    content: "Was here a couple weeks back. Excellent work as always!",
    authorName: "Nancy White",
    locationName: "Downtown Branch",
    daysAgo: 13,
  },
];

export const POST = withAuthRequired(async (req, context) => {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

  const { session } = context;
  const userId = session.user.id;

  try {
    const now = new Date();
    const reviewsToInsert = seedReviews.map((review) => ({
      userId,
      provider: review.provider,
      providerReviewId: review.providerReviewId,
      status: review.status,
      rating: review.rating,
      content: review.content,
      authorName: review.authorName,
      locationName: review.locationName,
      reviewCreatedAt: new Date(
        now.getTime() - review.daysAgo * 24 * 60 * 60 * 1000
      ),
    }));

    // Use onConflictDoNothing to avoid duplicates if run multiple times
    await db.insert(reviews).values(reviewsToInsert).onConflictDoNothing();

    // Get count of reviews for this user
    const userReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.userId, userId));

    return NextResponse.json({
      success: true,
      message: `Seeded reviews for user ${session.user.email}`,
      totalReviews: userReviews.length,
    });
  } catch (error) {
    console.error("Error seeding reviews:", error);
    return NextResponse.json(
      { error: "Failed to seed reviews" },
      { status: 500 }
    );
  }
});

export const DELETE = withAuthRequired(async (req, context) => {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

  const { session } = context;
  const userId = session.user.id;

  try {
    // Delete only seeded reviews (those with providerReviewId starting with "seed_")
    await db
      .delete(reviews)
      .where(
        and(
          eq(reviews.userId, userId),
          like(reviews.providerReviewId, "seed_%")
        )
      );

    return NextResponse.json({
      success: true,
      message: "Cleared all seeded reviews",
    });
  } catch (error) {
    console.error("Error clearing reviews:", error);
    return NextResponse.json(
      { error: "Failed to clear reviews" },
      { status: 500 }
    );
  }
});
