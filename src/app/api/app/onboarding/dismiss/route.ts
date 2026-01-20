import { NextResponse } from "next/server";
import withAuthRequired from "@/lib/auth/withAuthRequired";
import { db } from "@/db";
import { onboardingProgress } from "@/db/schema/onboarding";
import { eq } from "drizzle-orm";

export const POST = withAuthRequired(async (req, context) => {
  const userId = context.session.user.id;

  // Upsert the onboarding progress with dismissed = true
  await db
    .insert(onboardingProgress)
    .values({
      userId,
      dismissed: true,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: onboardingProgress.userId,
      set: {
        dismissed: true,
        updatedAt: new Date(),
      },
    });

  return NextResponse.json({ success: true });
});
