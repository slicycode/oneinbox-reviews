import { enqueueReviewSync } from "@/lib/jobs/reviews-sync";

export const enqueueReviewBackfill = async (
  userId: string,
  provider: string,
  providerAccountId?: string
): ReturnType<typeof enqueueReviewSync> => {
  const payload = await enqueueReviewSync(
    userId,
    provider,
    "backfill",
    providerAccountId
  );

  console.log(
    JSON.stringify({
      level: "info",
      event: "review.sync.backfill.queued",
      context: payload,
    })
  );

  return payload;
};
