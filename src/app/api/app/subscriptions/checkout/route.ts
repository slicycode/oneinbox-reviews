import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import withAuthRequired from "@/lib/auth/withAuthRequired";
import { db } from "@/db";
import { billingProfiles } from "@/db/schema/billing-profile";
import { subscriptions } from "@/db/schema/subscriptions";
import { createSubscriptionCheckout } from "@/lib/dodopayments";
import {
  planTierSchema,
  billingIntervalSchema,
  getDodoProductId,
  getPlanConfig,
  TRIAL_PERIOD_DAYS,
} from "@/lib/plans/config";
import { isActiveSubscription } from "@/lib/subscriptions/state-machine";

const checkoutRequestSchema = z.object({
  planTier: planTierSchema.exclude(["free"]),
  billingInterval: billingIntervalSchema.default("monthly"),
});

export const POST = withAuthRequired(async (req, context) => {
  const { session } = context;

  try {
    // Parse and validate request body
    const body = await req.json();
    const parseResult = checkoutRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request body",
            details: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { planTier, billingInterval } = parseResult.data;

    // Check if user already has an active subscription
    const existingSubscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, session.user.id))
      .limit(1)
      .then((rows) => rows[0]);

    if (existingSubscription && isActiveSubscription(existingSubscription.status)) {
      return NextResponse.json(
        {
          error: {
            code: "SUBSCRIPTION_EXISTS",
            message: "You already have an active subscription",
          },
        },
        { status: 400 }
      );
    }

    // Get the Dodo product ID for the selected plan and interval
    const dodoProductId = getDodoProductId(planTier, billingInterval);

    if (!dodoProductId) {
      return NextResponse.json(
        {
          error: {
            code: "PRODUCT_NOT_CONFIGURED",
            message: `${billingInterval} billing is not available for the ${planTier} plan`,
          },
        },
        { status: 400 }
      );
    }

    // Get user's billing profile
    const billingProfile = await db
      .select()
      .from(billingProfiles)
      .where(eq(billingProfiles.userId, session.user.id))
      .limit(1)
      .then((rows) => rows[0]);

    if (!billingProfile) {
      return NextResponse.json(
        {
          error: {
            code: "BILLING_PROFILE_REQUIRED",
            message: "Please complete your billing profile before subscribing",
          },
        },
        { status: 400 }
      );
    }

    // Get plan config for trial days
    const planConfig = getPlanConfig(planTier);

    // Create checkout session with Dodo
    const checkoutResponse = await createSubscriptionCheckout({
      productId: dodoProductId,
      customerEmail: session.user.email,
      customerId: existingSubscription?.dodoCustomerId || undefined,
      trialPeriodDays: planConfig.trialDays > 0 ? planConfig.trialDays : undefined,
      billing: {
        country: billingProfile.country,
        state: billingProfile.state,
        city: billingProfile.city,
        street: billingProfile.street,
        zipcode: billingProfile.zipcode,
      },
      taxId: billingProfile.taxId || undefined,
    });

    return NextResponse.json({
      checkoutUrl: checkoutResponse.payment_link,
      subscriptionId: checkoutResponse.subscription_id,
    });
  } catch (error) {
    console.error("Checkout creation failed:", error);
    return NextResponse.json(
      {
        error: {
          code: "CHECKOUT_FAILED",
          message: "Failed to create checkout session",
        },
      },
      { status: 500 }
    );
  }
});
