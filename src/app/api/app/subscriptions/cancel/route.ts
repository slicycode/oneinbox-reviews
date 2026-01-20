import { NextResponse } from "next/server";
import withAuthRequired from "@/lib/auth/withAuthRequired";
import { db } from "@/db";
import { subscriptions } from "@/db/schema/subscriptions";
import { eq, and } from "drizzle-orm";
import { cancelSubscription } from "@/lib/dodopayments";

export const POST = withAuthRequired(async (req, context) => {
  const { session } = context;

  try {
    // Get user's active subscription
    const subscription = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, session.user.id),
          eq(subscriptions.status, "active"),
        ),
      )
      .limit(1)
      .then((rows) => rows[0]);

    if (!subscription) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 },
      );
    }

    if (!subscription.dodoSubscriptionId) {
      return NextResponse.json(
        { error: "Subscription has no associated payment provider" },
        { status: 400 },
      );
    }

    // Cancel subscription at Dodo (end of period)
    await cancelSubscription(subscription.dodoSubscriptionId);

    // Update local subscription record
    await db
      .update(subscriptions)
      .set({
        cancelAtPeriodEnd: true,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscription.id));

    return NextResponse.json({
      success: true,
      message: "Subscription will be canceled at the end of the billing period",
      cancelAtPeriodEnd: true,
      currentPeriodEnd: subscription.currentPeriodEnd,
    });
  } catch (error) {
    console.error("Subscription cancellation failed:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 },
    );
  }
});
