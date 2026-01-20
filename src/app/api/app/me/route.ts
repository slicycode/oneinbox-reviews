import withAuthRequired from "@/lib/auth/withAuthRequired";
import { profileUpdateSchema } from "@/lib/validations/profile.schema";
import { db } from "@/db";
import { users } from "@/db/schema/user";
import { subscriptions } from "@/db/schema/subscriptions";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { MeResponse } from "./types";
import type { PlanTier } from "@/lib/plans/config";

export const GET = withAuthRequired(async (req, context) => {
  const { getCurrentPlan, getUser, session } = context;

  // You can also use context.session to get user id and email
  // from the jwt token (no database call is made in that case)

  const currentPlan = await getCurrentPlan();
  const userFromDb = await getUser();

  // Fetch subscription data
  const subscriptionData = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, session.user.id))
    .limit(1)
    .then((rows) => rows[0]);

  const subscription = subscriptionData
    ? {
        status: subscriptionData.status,
        planTier: subscriptionData.planTier as PlanTier,
        currentPeriodEnd: subscriptionData.currentPeriodEnd,
        cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
        trialEnd: subscriptionData.trialEnd,
      }
    : null;

  return NextResponse.json<MeResponse>({
    user: userFromDb,
    currentPlan,
    subscription,
  });
});

export const PATCH = withAuthRequired(async (req, context) => {
  try {
    const { session } = context;
    const body = await req.json();

    // Validate input data
    const validationResult = profileUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { name, image } = validationResult.data;

    // Update user in database
    const updatedUser = await db
      .update(users)
      .set({
        name,
        image,
      })
      .where(eq(users.id, session.user.id))
      .returning();

    if (!updatedUser.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return updated user data
    return NextResponse.json({
      user: updatedUser[0],
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
});
