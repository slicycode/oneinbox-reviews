"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BillingProfileForm } from "./billing-profile-form";
import { type BillingProfileInput } from "@/lib/validations/billing-profile.schema";

interface BillingProfileFormWrapperProps {
  initialValues?: BillingProfileInput | null;
  returnUrl?: string;
  plan?: string;
  interval?: string;
}

export function BillingProfileFormWrapper({
  initialValues,
  returnUrl,
  plan,
  interval,
}: BillingProfileFormWrapperProps) {
  const router = useRouter();

  const handleSuccess = () => {
    if (returnUrl) {
      const params = new URLSearchParams();
      if (plan) {
        params.set("plan", plan);
      }
      if (interval) {
        params.set("interval", interval);
      }
      params.set("billingComplete", "true");
      const queryString = params.toString();
      router.push(`${returnUrl}${queryString ? `?${queryString}` : ""}`);
    }
  };

  return (
    <BillingProfileForm
      initialValues={initialValues}
      onSuccess={returnUrl ? handleSuccess : undefined}
    />
  );
}
