import { db } from "../src/db";
import { reviews } from "../src/db/schema/reviews";
import { reviewSyncStatus } from "../src/db/schema/review-sync-status";
import { users } from "../src/db/schema/user";
import { eq } from "drizzle-orm";

const args = process.argv.slice(2);
const getArg = (name: string, alias?: string) => {
  const nameIndex = args.indexOf(`--${name}`);
  if (nameIndex !== -1 && args[nameIndex + 1]) {
    return args[nameIndex + 1];
  }
  if (alias) {
    const aliasIndex = args.indexOf(`-${alias}`);
    if (aliasIndex !== -1 && args[aliasIndex + 1]) {
      return args[aliasIndex + 1];
    }
  }
  return null;
};

const email = getArg("email", "e");
const countRaw = getArg("count", "c");
const count = Math.max(1, Number(countRaw ?? 3));

if (!email) {
  console.error("Usage: pnpm run seed:reviews -- --email you@example.com [--count 3]");
  process.exit(1);
}

const templates = [
  {
    rating: 5,
    content: "Amazing service and quick response.",
    authorName: "Alex J",
    authorUrl: "https://example.com/alex",
    locationName: "OneInbox HQ",
  },
  {
    rating: 2,
    content: "Slow support, still waiting.",
    authorName: "Priya S",
    authorUrl: "https://example.com/priya",
    locationName: "OneInbox HQ",
  },
  {
    rating: 4,
    content: "Good overall, room to improve.",
    authorName: "Marco T",
    authorUrl: "https://example.com/marco",
    locationName: "OneInbox HQ",
  },
  {
    rating: 1,
    content: "Unresolved issue after multiple attempts.",
    authorName: "Jamie K",
    authorUrl: "https://example.com/jamie",
    locationName: "OneInbox HQ",
  },
];
const statuses = ["unread", "needs_follow_up", "responded"] as const;

const run = async () => {
  const user = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
    .then((rows) => rows[0]);

  if (!user) {
    console.error(`No user found for email: ${email}`);
    process.exit(1);
  }

  const now = new Date();
  const values = Array.from({ length: count }, (_, index) => {
    const template = templates[index % templates.length];
    const reviewCreatedAt = new Date(
      now.getTime() - (index + 1) * 24 * 60 * 60 * 1000
    );

    return {
      userId: user.id,
      provider: "google",
      providerReviewId: `seed-${user.id}-${index + 1}`,
      status: statuses[index % statuses.length],
      rating: template.rating,
      content: template.content,
      authorName: template.authorName,
      authorUrl: template.authorUrl,
      reviewUrl: `https://maps.google.com/review/${index + 1}`,
      replyUrl: `https://maps.google.com/reply/${index + 1}`,
      locationName: template.locationName,
      reviewCreatedAt,
      createdAt: now,
      updatedAt: now,
    };
  });

  const inserted = await db
    .insert(reviews)
    .values(values)
    .onConflictDoNothing({
      target: [reviews.userId, reviews.provider, reviews.providerReviewId],
    })
    .returning({ id: reviews.id });

  await db
    .insert(reviewSyncStatus)
    .values({
      userId: user.id,
      provider: "google",
      status: "active",
      lastSuccessAt: now,
      lastAttemptAt: now,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [reviewSyncStatus.userId, reviewSyncStatus.provider],
      set: {
        status: "active",
        lastSuccessAt: now,
        lastAttemptAt: now,
        updatedAt: now,
      },
    });

  console.log(`Seeded ${inserted.length} review(s) for ${user.email}.`);
};

run().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
