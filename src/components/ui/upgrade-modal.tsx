"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Check,
  X,
  Sparkles,
  Zap,
  Infinity,
  Bell,
  Calendar,
  ArrowRight,
  Loader2,
  Shield,
} from "lucide-react";
import { type BillingInterval } from "@/lib/plans/config";

interface UpgradeModalProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultInterval?: BillingInterval;
}

const features = [
  {
    icon: Infinity,
    name: "Unlimited Reviews",
    free: "50 reviews",
    starter: "Unlimited",
    description: "No more limits on how many reviews you can manage",
  },
  {
    icon: Bell,
    name: "Email Alerts",
    free: false,
    starter: true,
    description: "Get notified instantly when new reviews come in",
  },
  {
    icon: Calendar,
    name: "Data Retention",
    free: "30 days",
    starter: "1 year",
    description: "Keep your review history longer for better insights",
  },
  {
    icon: Zap,
    name: "Advanced Filters",
    free: false,
    starter: true,
    description: "Filter and sort reviews by any criteria",
  },
];

const benefits = [
  "14-day free trial",
  "Cancel anytime",
  "No credit card required to start",
];

export function UpgradeModal({
  trigger,
  open,
  onOpenChange,
  defaultInterval = "monthly",
}: UpgradeModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [billingInterval, setBillingInterval] =
    React.useState<BillingInterval>(defaultInterval);
  const [internalOpen, setInternalOpen] = React.useState(false);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange! : setInternalOpen;

  const monthlyPrice = 49;
  const yearlyPrice = 490;
  const yearlySavings = monthlyPrice * 12 - yearlyPrice;

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/app/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planTier: "starter",
          billingInterval,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.code === "BILLING_PROFILE_REQUIRED") {
          toast.error("Please complete your billing profile first");
          router.push("/app/billing/profile");
          return;
        }
        toast.error(data.error?.message || "Failed to start checkout");
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <DialogTitle className="text-xl">Upgrade to Starter</DialogTitle>
          </div>
          <DialogDescription>
            Unlock the full power of OneInbox Reviews
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-2 rounded-lg bg-muted p-1">
            <button
              onClick={() => setBillingInterval("monthly")}
              className={cn(
                "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                billingInterval === "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval("yearly")}
              className={cn(
                "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                billingInterval === "yearly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Yearly
              <Badge
                variant="secondary"
                className="ml-2 bg-green-500/10 text-green-600 text-xs"
              >
                Save ${yearlySavings}
              </Badge>
            </button>
          </div>

          {/* Price Display */}
          <div className="text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold">
                ${billingInterval === "monthly" ? monthlyPrice : yearlyPrice}
              </span>
              <span className="text-muted-foreground">
                /{billingInterval === "monthly" ? "month" : "year"}
              </span>
            </div>
            {billingInterval === "yearly" && (
              <p className="text-sm text-muted-foreground mt-1">
                That&apos;s ${Math.round(yearlyPrice / 12)}/month billed
                annually
              </p>
            )}
          </div>

          {/* Feature Comparison */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              What you&apos;ll get
            </h4>
            <div className="space-y-2">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.name}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm">{feature.name}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground line-through">
                            {typeof feature.free === "boolean" ? (
                              feature.free ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <X className="h-3 w-3" />
                              )
                            ) : (
                              feature.free
                            )}
                          </span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium text-green-600">
                            {typeof feature.starter === "boolean" ? (
                              feature.starter ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <X className="h-3 w-3" />
                              )
                            ) : (
                              feature.starter
                            )}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Benefits */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-green-600" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleUpgrade}
            disabled={isLoading}
            size="lg"
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Your 14-day free trial starts immediately. You won&apos;t be charged
            until the trial ends.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
