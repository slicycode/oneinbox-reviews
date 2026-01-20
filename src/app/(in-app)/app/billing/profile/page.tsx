import { auth, signIn } from "@/auth";
import { db } from "@/db";
import { billingProfiles } from "@/db/schema/billing-profile";
import { eq } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BillingProfileFormWrapper } from "@/features/billing/billing-profile-form-wrapper";

interface BillingProfilePageProps {
  searchParams: Promise<{
    returnUrl?: string;
    plan?: string;
    interval?: string;
  }>;
}

export default async function BillingProfilePage({
  searchParams,
}: BillingProfilePageProps) {
  const { returnUrl, plan, interval } = await searchParams;
  const session = await auth();

  if (!session?.user?.id) {
    return signIn();
  }

  const billingProfile = await db
    .select()
    .from(billingProfiles)
    .where(eq(billingProfiles.userId, session.user.id))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  const initialValues = billingProfile
    ? {
      country: billingProfile.country,
      state: billingProfile.state,
      city: billingProfile.city,
      street: billingProfile.street,
      zipcode: billingProfile.zipcode,
      isBusinessCustomer: billingProfile.isBusinessCustomer,
      taxId: billingProfile.taxId ?? undefined,
    }
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Billing Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Update your billing details to keep your account information current.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Billing Details</CardTitle>
          <CardDescription>
            These details are used for billing and receipts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BillingProfileFormWrapper
            initialValues={initialValues}
            returnUrl={returnUrl}
            plan={plan}
            interval={interval}
          />
        </CardContent>
      </Card>
    </div>
  );
}
