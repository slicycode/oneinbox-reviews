import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * GET /api/app/subscriptions/success
 *
 * Handles redirect from DodoPayments after successful checkout.
 * The actual subscription creation is handled by the webhook.
 * This endpoint just validates the session and redirects to the app.
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const provider = searchParams.get("provider");
  const subscriptionId = searchParams.get("subscription_id");

  // Get the base URL for redirects
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

  // Verify user is authenticated
  const session = await auth();

  if (!session?.user?.id) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=/app&checkout=success`, baseUrl)
    );
  }

  // Log successful checkout for debugging
  if (provider === "dodo" && subscriptionId) {
    console.log(
      `Checkout success redirect: user=${session.user.id}, subscription=${subscriptionId}`
    );
  }

  // Redirect to app with success message
  // The webhook will have already created/updated the subscription
  const redirectUrl = new URL("/app", baseUrl);
  redirectUrl.searchParams.set("checkout", "success");

  return NextResponse.redirect(redirectUrl);
}
