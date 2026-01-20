import { NextResponse } from "next/server";
import withAuthRequired from "@/lib/auth/withAuthRequired";
import { db } from "@/db";
import { subscriptions } from "@/db/schema/subscriptions";
import { eq, and } from "drizzle-orm";
import { resumeSubscription } from "@/lib/dodopayments";

export const POST = withAuthRequired(async (req, context) => {
  const { session } = context;

  try {
    // Get user's subscription that is set to cancel at period end
    const subscription = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, session.user.id),
          eq(subscriptions.cancelAtPeriodEnd, true),
        ),
      )
      .limit(1)
      .then((rows) => rows[0]);

    if (!subscription) {
      return NextResponse.json(
        { error: "No subscription pending cancellation found" },
        { status: 404 },
      );
    }

    if (!subscription.dodoSubscriptionId) {
      return NextResponse.json(
        { error: "Subscription has no associated payment provider" },
        { status: 400 },
      );
    }

    // Resume subscription at Dodo
    await resumeSubscription(subscription.dodoSubscriptionId);

    // Update local subscription record
    await db
      .update(subscriptions)
      .set({
        cancelAtPeriodEnd: false,
        canceledAt: null,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscription.id));

    return NextResponse.json({
      success: true,
      message: "Subscription has been resumed",
      cancelAtPeriodEnd: false,
    });
  } catch (error) {
    console.error("Subscription resume failed:", error);
    return NextResponse.json(
      { error: "Failed to resume subscription" },
      { status: 500 },
    );
  }
});
