import { NextResponse } from "next/server";
import withAuthRequired from "@/lib/auth/withAuthRequired";
import { db } from "@/db";
import { subscriptions } from "@/db/schema/subscriptions";
import { eq } from "drizzle-orm";

export const GET = withAuthRequired(async (req, context) => {
  const { session } = context;

  try {
    const subscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, session.user.id))
      .limit(1)
      .then((rows) => rows[0]);

    if (!subscription) {
      return NextResponse.json({
        subscription: null,
        message: "No active subscription",
      });
    }

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        dodoSubscriptionId: subscription.dodoSubscriptionId,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        trialStart: subscription.trialStart,
        trialEnd: subscription.trialEnd,
        canceledAt: subscription.canceledAt,
      },
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 },
    );
  }
});
