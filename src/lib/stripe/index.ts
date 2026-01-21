import Stripe from "stripe";

let cachedClient: Stripe | null = null;

export const getStripeClient = (): Stripe => {
  if (cachedClient) {
    return cachedClient;
  }

  const apiKey = process.env.STRIPE_SECRET_KEY;

  if (!apiKey) {
    throw new Error("STRIPE_SECRET_KEY must be set");
  }

  cachedClient = new Stripe(apiKey);

  return cachedClient;
};

// Default export for backwards compatibility - use getStripeClient() for new code
export default {
  get billingPortal() {
    return getStripeClient().billingPortal;
  },
  get customers() {
    return getStripeClient().customers;
  },
  get subscriptions() {
    return getStripeClient().subscriptions;
  },
  get invoices() {
    return getStripeClient().invoices;
  },
  get paymentIntents() {
    return getStripeClient().paymentIntents;
  },
  get checkout() {
    return getStripeClient().checkout;
  },
  get webhooks() {
    return getStripeClient().webhooks;
  },
} as Stripe;