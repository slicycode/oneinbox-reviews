import { NextRequest, NextResponse } from "next/server";
import APIError from "@/lib/api/errors";
import getOrCreateUser from "@/lib/users/getOrCreateUser";
import { users } from "@/db/schema/user";
import { plans } from "@/db/schema/plans";
import { subscriptions, SubscriptionStatus } from "@/db/schema/subscriptions";
import { db } from "@/db";
import { eq, or } from "drizzle-orm";
import updatePlan from "@/lib/plans/updatePlan";
import downgradeToDefaultPlan from "@/lib/plans/downgradeToDefaultPlan";
import { allocatePlanCredits } from "@/lib/credits/allocatePlanCredits";
import { addCredits } from "@/lib/credits/recalculate";
import { CreditType } from "@/lib/credits/credits";
import { Webhook } from "standardwebhooks";

class DodoPaymentsWebhookHandler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private data: any;
  private eventType: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(data: any, eventType: string) {
    this.data = data;
    this.eventType = eventType;
  }

  async handleOutsidePlanManagementProductPaid() {
    const payment = this.data;

    // Check if this is a credit purchase using metadata
    const metadata = payment.metadata;

    if (metadata?.purchaseType === "credits") {
      // This is a credit purchase - extract info from metadata
      const creditType = metadata.creditType;
      const creditAmount = parseInt(metadata.creditAmount);
      const userId = metadata.userId;
      const paymentId =
        payment.payment_id ||
        `payment_${payment.customer.customer_id}_${Date.now()}`;

      if (!creditType || !creditAmount || creditAmount <= 0 || !userId) {
        console.error("Invalid credit metadata in DodoPayments webhook:", {
          creditType,
          creditAmount,
          userId,
          metadata,
        });
        return;
      }

      try {
        // Use the userId from metadata instead of looking up by email
        // But still ensure user exists and update customer info if needed
        const { user } = await getOrCreateUser({
          emailId: payment.customer.email,
          name: payment.customer.name,
        });

        // Verify the user ID matches (security check)
        if (user.id !== userId) {
          console.error("User ID mismatch in DodoPayments webhook:", {
            metadataUserId: userId,
            actualUserId: user.id,
            email: payment.customer.email,
          });
          return;
        }

        // Add credits with payment ID for idempotency
        await addCredits(
          userId,
          creditType as CreditType,
          creditAmount,
          paymentId,
          {
            reason: "Purchase via DodoPayments",
            dodoPaymentId: paymentId,
            dodoCustomerId: payment.customer.customer_id,
            totalPrice: metadata.totalPrice,
          },
        );

        console.log(
          `Successfully added ${creditAmount} ${creditType} credits to user ${userId} via DodoPayments payment ${paymentId}`,
        );
      } catch (error) {
        console.error("Error adding credits from DodoPayments:", error);
        // If it's a duplicate payment error, that's okay - idempotency working
        if (
          error instanceof Error &&
          error.message.includes("already exists")
        ) {
          console.log(
            `Credits purchase already processed for DodoPayments payment ${paymentId}`,
          );
        } else {
          throw error; // Re-throw other errors
        }
      }
    } else {
      // Handle other non-plan products here if needed
      console.log(
        "DodoPayments payment for non-plan, non-credit product. Metadata:",
        metadata,
      );
    }
  }

  // Payment Events
  async onPaymentSucceeded() {
    const payment = this.data;

    if (!payment?.customer?.email) {
      return;
    }

    try {
      const { user } = await getOrCreateUser({
        emailId: payment.customer.email,
        name: payment.customer.name,
      });

      // For one-time payments
      const productId = payment.product_cart?.[0]?.product_id;

      if (!productId) {
        // Must be a subscription payment, so we don't need to handle this
        throw new APIError("No product found in payment");
      }

      // Update user's Dodo customer ID if not set
      if (!user.dodoCustomerId && payment.customer.customer_id) {
        await db
          .update(users)
          .set({
            dodoCustomerId: payment.customer.customer_id,
          })
          .where(eq(users.id, user.id));
      }

      const dbPlan = await this._getPlanFromDodoProductId(productId);

      if (!dbPlan) {
        await this.handleOutsidePlanManagementProductPaid();
      } else {
        await updatePlan({
          userId: user.id,
          newPlanId: dbPlan.id,
        });

        // Allocate plan-based credits
        await allocatePlanCredits({
          userId: user.id,
          planId: dbPlan.id,
          paymentId:
            payment.payment_id ||
            `payment_${payment.customer.customer_id}_${Date.now()}`,
          paymentMetadata: {
            source: "dodo_payment",
            customerId: payment.customer.customer_id,
            customerEmail: payment.customer.email,
            productId,
          },
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async onPaymentFailed() {
    // Payment failed, no action needed
  }

  async onPaymentProcessing() {
    // Payment is in process, no action needed
  }

  async onPaymentCancelled() {
    // Payment was cancelled, no plan updates needed
  }

  // Refund Events
  async onRefundSucceeded() {
    // No specific action needed for refunds
  }

  async onRefundFailed() {
    // No action needed
  }

  // Dispute Events
  async onDisputeOpened() {
    // Flag the account, may want to notify admin
  }

  async onDisputeExpired() {
    // No action needed
  }

  async onDisputeAccepted() {
    // May need to downgrade the user's plan if dispute was about payment
  }

  async onDisputeCancelled() {
    // No action needed
  }

  async onDisputeChallenged() {
    // No action needed
  }

  async onDisputeWon() {
    // Ensure user's plan is correct
  }

  async onDisputeLost() {
    // May need to downgrade the user's plan
  }

  async _getPlanFromDodoProductId(productId: string) {
    try {
      const plan = await db
        .select()
        .from(plans)
        .where(
          or(
            eq(plans.monthlyDodoProductId, productId),
            eq(plans.yearlyDodoProductId, productId),
            eq(plans.onetimeDodoProductId, productId),
          ),
        )
        .limit(1);

      if (plan.length === 0) {
        return null;
      }

      return plan[0];
    } catch (error) {
      throw error;
    }
  }

  async _upsertSubscription(
    userId: string,
    dodoData: {
      subscriptionId: string;
      productId?: string;
      customerId?: string;
      status: SubscriptionStatus;
      planTier?: string;
      currentPeriodStart?: Date;
      currentPeriodEnd?: Date;
      trialStart?: Date;
      trialEnd?: Date;
      cancelAtPeriodEnd?: boolean;
      canceledAt?: Date | null;
    },
  ) {
    const existing = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1)
      .then((rows) => rows[0]);

    if (existing) {
      await db
        .update(subscriptions)
        .set({
          dodoSubscriptionId: dodoData.subscriptionId,
          dodoProductId: dodoData.productId ?? existing.dodoProductId,
          dodoCustomerId: dodoData.customerId ?? existing.dodoCustomerId,
          status: dodoData.status,
          planTier: dodoData.planTier ?? existing.planTier,
          currentPeriodStart:
            dodoData.currentPeriodStart ?? existing.currentPeriodStart,
          currentPeriodEnd:
            dodoData.currentPeriodEnd ?? existing.currentPeriodEnd,
          trialStart: dodoData.trialStart ?? existing.trialStart,
          trialEnd: dodoData.trialEnd ?? existing.trialEnd,
          cancelAtPeriodEnd:
            dodoData.cancelAtPeriodEnd ?? existing.cancelAtPeriodEnd,
          canceledAt: dodoData.canceledAt,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, existing.id));
    } else {
      await db.insert(subscriptions).values({
        userId,
        dodoSubscriptionId: dodoData.subscriptionId,
        dodoProductId: dodoData.productId,
        planTier: dodoData.planTier ?? "free",
        dodoCustomerId: dodoData.customerId,
        status: dodoData.status,
        currentPeriodStart: dodoData.currentPeriodStart,
        currentPeriodEnd: dodoData.currentPeriodEnd,
        trialStart: dodoData.trialStart,
        trialEnd: dodoData.trialEnd,
        cancelAtPeriodEnd: dodoData.cancelAtPeriodEnd ?? false,
        canceledAt: dodoData.canceledAt,
      });
    }
  }

  // Subscription Events
  async onSubscriptionCreated() {
    const subscription = this.data;

    if (!subscription?.customer?.email) {
      return;
    }

    try {
      const { user } = await getOrCreateUser({
        emailId: subscription.customer.email,
        name: subscription.customer.name,
      });

      // Update user's Dodo customer ID if not set
      if (!user.dodoCustomerId && subscription.customer.customer_id) {
        await db
          .update(users)
          .set({
            dodoCustomerId: subscription.customer.customer_id,
            dodoSubscriptionId: subscription.subscription_id,
          })
          .where(eq(users.id, user.id));
      } else {
        // Just update subscription ID
        await db
          .update(users)
          .set({
            dodoSubscriptionId: subscription.subscription_id,
          })
          .where(eq(users.id, user.id));
      }

      // Get the product ID from the subscription
      const productId = subscription.product_id;
      if (!productId) {
        throw new APIError("No product found in subscription");
      }

      const dbPlan = await this._getPlanFromDodoProductId(productId);
      if (!dbPlan) {
        // Handle outside plan management subscription
        return;
      }

      // Determine subscription status based on trial
      const isTrialing =
        subscription.trial_period_days > 0 ||
        subscription.status === "trialing";
      const status: SubscriptionStatus = isTrialing ? "trialing" : "active";

      // Upsert subscription record
      await this._upsertSubscription(user.id, {
        subscriptionId: subscription.subscription_id,
        productId: productId,
        customerId: subscription.customer.customer_id,
        status,
        planTier: dbPlan.codename ?? "starter",
        currentPeriodStart: subscription.current_period_start
          ? new Date(subscription.current_period_start)
          : undefined,
        currentPeriodEnd: subscription.current_period_end
          ? new Date(subscription.current_period_end)
          : undefined,
        trialStart: subscription.trial_start
          ? new Date(subscription.trial_start)
          : undefined,
        trialEnd: subscription.trial_end
          ? new Date(subscription.trial_end)
          : undefined,
        cancelAtPeriodEnd: false,
        canceledAt: null,
      });

      await updatePlan({ userId: user.id, newPlanId: dbPlan.id });

      // Allocate plan-based credits
      await allocatePlanCredits({
        userId: user.id,
        planId: dbPlan.id,
        paymentId: subscription.subscription_id,
        paymentMetadata: {
          source: "dodo_subscription",
          subscriptionId: subscription.subscription_id,
          customerId: subscription.customer.customer_id,
          customerEmail: subscription.customer.email,
          productId,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async onSubscriptionActive() {
    const subscription = this.data;

    if (!subscription?.customer?.email) {
      // If no email, try to find user by subscription ID
      const user = await db
        .select()
        .from(users)
        .where(eq(users.dodoSubscriptionId, subscription.subscription_id))
        .limit(1)
        .then((rows) => rows[0]);

      if (user) {
        await this._upsertSubscription(user.id, {
          subscriptionId: subscription.subscription_id,
          status: "active",
          currentPeriodStart: subscription.current_period_start
            ? new Date(subscription.current_period_start)
            : undefined,
          currentPeriodEnd: subscription.current_period_end
            ? new Date(subscription.current_period_end)
            : undefined,
          cancelAtPeriodEnd: false,
          canceledAt: null,
        });
      }
      return;
    }

    // Full handling with user creation
    await this.onSubscriptionCreated();
  }

  async onSubscriptionOnHold() {
    const subscription = this.data;

    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.dodoSubscriptionId, subscription.subscription_id))
        .limit(1);

      if (!user?.[0]) {
        return;
      }

      // Update subscription status to past_due (on hold typically means payment issue)
      await this._upsertSubscription(user[0].id, {
        subscriptionId: subscription.subscription_id,
        status: "past_due",
      });
    } catch (error) {
      console.error(error);
    }
  }

  async onSubscriptionRenewed() {
    const subscription = this.data;

    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.dodoSubscriptionId, subscription.subscription_id))
        .limit(1);

      if (!user?.[0]) {
        return;
      }

      // Ensure the plan is still correctly set
      const productId = subscription.product_id;
      if (!productId) {
        return;
      }

      const dbPlan = await this._getPlanFromDodoProductId(productId);
      if (!dbPlan) {
        return;
      }

      // Update subscription with new period
      await this._upsertSubscription(user[0].id, {
        subscriptionId: subscription.subscription_id,
        status: "active",
        currentPeriodStart: subscription.current_period_start
          ? new Date(subscription.current_period_start)
          : undefined,
        currentPeriodEnd: subscription.current_period_end
          ? new Date(subscription.current_period_end)
          : undefined,
        cancelAtPeriodEnd: false,
        canceledAt: null,
      });

      await updatePlan({ userId: user[0].id, newPlanId: dbPlan.id });
      // Allocate plan-based credits
      await allocatePlanCredits({
        planId: dbPlan.id,
        userId: user[0].id,
        paymentId: `${subscription.subscription_id}_${Date.now()}`,
        paymentMetadata: {
          source: "dodo_subscription_renewed",
          subscriptionId: subscription.subscription_id,
          productId,
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

  async onSubscriptionPaused() {
    const subscription = this.data;

    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.dodoSubscriptionId, subscription.subscription_id))
        .limit(1);

      if (!user?.[0]) {
        return;
      }

      // Update subscription status to paused
      await this._upsertSubscription(user[0].id, {
        subscriptionId: subscription.subscription_id,
        status: "paused",
      });
    } catch (error) {
      console.error(error);
    }
  }

  async onSubscriptionCancelled() {
    const subscription = this.data;

    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.dodoSubscriptionId, subscription.subscription_id))
        .limit(1);

      if (!user?.[0]) {
        return;
      }

      // Update subscription status to canceled
      await this._upsertSubscription(user[0].id, {
        subscriptionId: subscription.subscription_id,
        status: "canceled",
        canceledAt: new Date(),
        cancelAtPeriodEnd: false,
      });

      await downgradeToDefaultPlan({ userId: user[0].id });
    } catch (error) {
      console.error(error);
    }
  }

  async onSubscriptionFailed() {
    const subscription = this.data;

    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.dodoSubscriptionId, subscription.subscription_id))
        .limit(1);

      if (!user?.[0]) {
        return;
      }

      // Update subscription status to past_due on failure
      await this._upsertSubscription(user[0].id, {
        subscriptionId: subscription.subscription_id,
        status: "past_due",
      });
    } catch (error) {
      console.error(error);
    }
  }

  async onSubscriptionExpired() {
    const subscription = this.data;

    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.dodoSubscriptionId, subscription.subscription_id))
        .limit(1);

      if (!user?.[0]) {
        return;
      }

      // Update subscription status to canceled (expired)
      await this._upsertSubscription(user[0].id, {
        subscriptionId: subscription.subscription_id,
        status: "canceled",
        canceledAt: new Date(),
      });

      await downgradeToDefaultPlan({ userId: user[0].id });
    } catch (error) {
      console.error(error);
    }
  }

  // License Key Events
  async onLicenseKeyCreated() {
    const licenseKey = this.data;
    console.log("License key created", licenseKey);
    // Store the license key info if needed
  }

  async onCustomerCreated() {
    const customer = this.data;

    if (!customer?.email) {
      return;
    }

    try {
      const { user } = await getOrCreateUser({
        emailId: customer.email,
        name: customer.name,
      });

      await db
        .update(users)
        .set({
          dodoCustomerId: customer.customer_id,
        })
        .where(eq(users.id, user.id));
    } catch (error) {
      console.error(error);
    }
  }
}

async function handler(req: NextRequest) {
  if (req.method === "POST") {
    try {
      const bodyText = await req.text();
      // Check if webhook signing is configured
      const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;

      if (webhookSecret) {
        // Retrieve the event by verifying the signature using the raw body and secret
        try {
          const webhook = new Webhook(webhookSecret);
          const headers = {
            "webhook-id": req.headers.get("webhook-id") as string,
            "webhook-signature": req.headers.get("webhook-signature") as string,
            "webhook-timestamp": req.headers.get("webhook-timestamp") as string,
          };

          await webhook.verify(bodyText, headers);
        } catch (err) {
          console.error(err);
          return NextResponse.json(
            {
              received: true,
              error: "Webhook signature verification failed",
            },
            { status: 401 },
          );
        }
      } else {
        if (process.env.NODE_ENV !== "development") {
          return NextResponse.json(
            {
              received: true,
              error: "Webhook secret not configured",
            },
            { status: 500 },
          );
        }
      }

      const data = JSON.parse(bodyText);
      const eventType = data.type;
      const eventData = data.data;

      const handler = new DodoPaymentsWebhookHandler(eventData, eventType);
      try {
        switch (eventType) {
          // Payment Events
          case "payment.succeeded":
            await handler.onPaymentSucceeded();
            break;
          case "payment.failed":
            await handler.onPaymentFailed();
            break;
          case "payment.processing":
            await handler.onPaymentProcessing();
            break;
          case "payment.cancelled":
            await handler.onPaymentCancelled();
            break;

          // Refund Events
          case "refund.succeeded":
            await handler.onRefundSucceeded();
            break;
          case "refund.failed":
            await handler.onRefundFailed();
            break;

          // Dispute Events
          case "dispute.opened":
            await handler.onDisputeOpened();
            break;
          case "dispute.expired":
            await handler.onDisputeExpired();
            break;
          case "dispute.accepted":
            await handler.onDisputeAccepted();
            break;
          case "dispute.cancelled":
            await handler.onDisputeCancelled();
            break;
          case "dispute.challenged":
            await handler.onDisputeChallenged();
            break;
          case "dispute.won":
            await handler.onDisputeWon();
            break;
          case "dispute.lost":
            await handler.onDisputeLost();
            break;

          // Subscription Events
          case "subscription.created": // This is for backward compatibility
          case "subscription.active":
            await handler.onSubscriptionActive();
            break;
          case "subscription.on_hold":
            await handler.onSubscriptionOnHold();
            break;
          case "subscription.renewed":
            await handler.onSubscriptionRenewed();
            break;
          case "subscription.paused":
            await handler.onSubscriptionPaused();
            break;
          case "subscription.cancelled":
            await handler.onSubscriptionCancelled();
            break;
          case "subscription.failed":
            await handler.onSubscriptionFailed();
            break;
          case "subscription.expired":
            await handler.onSubscriptionExpired();
            break;

          // License Key Events
          case "license_key.created":
            await handler.onLicenseKeyCreated();
            break;

          // Customer Events
          case "customer.created":
            await handler.onCustomerCreated();
            break;

          default:
            break;
        }

        return NextResponse.json({ received: true });
      } catch (error) {
        if (error instanceof APIError) {
          return NextResponse.json({
            received: true,
            message: error.message,
          });
        }
        return NextResponse.json(
          {
            received: true,
            error: "Unexpected error processing webhook",
          },
          { status: 500 },
        );
      }
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        {
          received: false,
          error: "Invalid webhook payload",
        },
        { status: 400 },
      );
    }
  } else {
    return NextResponse.json(
      {
        received: false,
        error: "Method not allowed",
      },
      { status: 405 },
    );
  }
}

export const POST = handler;

export const maxDuration = 20;
