"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Check,
  Circle,
  Link2,
  RefreshCw,
  Inbox,
  Bell,
  PartyPopper,
  X,
} from "lucide-react";

interface OnboardingStep {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
}

interface OnboardingChecklistProps {
  progress: {
    connectGoogle: boolean;
    syncReviews: boolean;
    viewInbox: boolean;
    setupAlerts: boolean;
    dismissed: boolean;
  };
  onDismiss?: () => void;
}

export function OnboardingChecklist({
  progress,
  onDismiss,
}: OnboardingChecklistProps) {
  const router = useRouter();
  const [isDismissing, setIsDismissing] = React.useState(false);

  const steps: OnboardingStep[] = [
    {
      id: "connectGoogle",
      label: "Connect Google",
      description: "Link your Google Business Profile",
      href: "/app/integrations",
      icon: Link2,
      completed: progress.connectGoogle,
    },
    {
      id: "syncReviews",
      label: "Sync reviews",
      description: "Import your first reviews",
      href: "/app/integrations",
      icon: RefreshCw,
      completed: progress.syncReviews,
    },
    {
      id: "viewInbox",
      label: "View inbox",
      description: "See your reviews in the inbox",
      href: "/app/inbox",
      icon: Inbox,
      completed: progress.viewInbox,
    },
    {
      id: "setupAlerts",
      label: "Set up alerts",
      description: "Get notified about negative reviews",
      href: "/app/inbox",
      icon: Bell,
      completed: progress.setupAlerts,
    },
  ];

  const completedCount = steps.filter((step) => step.completed).length;
  const totalSteps = steps.length;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);
  const isComplete = completedCount === totalSteps;

  const handleDismiss = async () => {
    setIsDismissing(true);
    try {
      await fetch("/api/app/onboarding/dismiss", { method: "POST" });
      onDismiss?.();
      router.refresh();
    } catch (error) {
      console.error("Failed to dismiss onboarding:", error);
    } finally {
      setIsDismissing(false);
    }
  };

  // Don't render if dismissed
  if (progress.dismissed) {
    return null;
  }

  return (
    <Card className={cn(isComplete && "border-green-500/50 bg-green-50/50 dark:bg-green-950/20")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {isComplete ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                <PartyPopper className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <span className="text-sm font-bold text-primary">
                  {completedCount}/{totalSteps}
                </span>
              </div>
            )}
            <div>
              <CardTitle className="text-lg">
                {isComplete ? "You're all set!" : "Getting Started"}
              </CardTitle>
              <CardDescription>
                {isComplete
                  ? "You've completed all onboarding steps"
                  : "Complete these steps to get the most out of OneInbox"}
              </CardDescription>
            </div>
          </div>
          {(isComplete || completedCount >= 2) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              disabled={isDismissing}
              className="h-8 w-8"
              aria-label="Dismiss onboarding"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {!isComplete && (
          <Progress value={progressPercent} className="mt-3 h-2" />
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Link
                key={step.id}
                href={step.href}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 transition-colors",
                  step.completed
                    ? "border-green-200 bg-green-50/50 dark:border-green-800/50 dark:bg-green-950/30"
                    : "hover:bg-muted/50"
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                    step.completed
                      ? "bg-green-500 text-white"
                      : "border-2 border-muted-foreground/30"
                  )}
                >
                  {step.completed ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Circle className="h-3 w-3 text-muted-foreground/50" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        step.completed && "text-green-700 dark:text-green-400"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
