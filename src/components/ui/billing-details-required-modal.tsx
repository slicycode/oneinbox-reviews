"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreditCard, ArrowRight } from "lucide-react";

interface BillingDetailsRequiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BillingDetailsRequiredModal({
  open,
  onOpenChange,
}: BillingDetailsRequiredModalProps) {
  const router = useRouter();

  const handleCompleteBilling = () => {
    onOpenChange(false);
    router.push("/app/billing/profile");
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CreditCard className="h-5 w-5" />
            </div>
            <AlertDialogTitle>Billing Details Required</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            Before upgrading your plan, we need your billing information for tax
            purposes and to process your subscription. This only takes a moment.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleCompleteBilling}>
            Complete Billing Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
