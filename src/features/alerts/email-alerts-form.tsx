"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send, Bell, Clock, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { UpgradeBanner } from "@/components/ui/upgrade-banner";
import {
  alertSettingsSchema,
  notificationFrequencyValues,
} from "@/lib/validations/alert-settings.schema";

type NotificationFrequency = (typeof notificationFrequencyValues)[number];

type AlertSettingsFormValues = {
  emailAlertsEnabled: boolean;
  negativeReviewThreshold: number;
  alertsPaused: boolean;
  notificationFrequency: NotificationFrequency;
  notifyOnAllReviews: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
};

const frequencyOptions = [
  { value: "immediate", label: "Immediate", description: "Get notified right away" },
  { value: "daily_digest", label: "Daily Digest", description: "Once per day summary" },
  { value: "weekly_digest", label: "Weekly Digest", description: "Once per week summary" },
];

interface EmailAlertsFormProps {
  initialEnabled: boolean;
  initialThreshold: number;
  initialPaused: boolean;
  initialFrequency?: NotificationFrequency;
  initialNotifyOnAll?: boolean;
  initialQuietHoursEnabled?: boolean;
  initialQuietHoursStart?: string;
  initialQuietHoursEnd?: string;
  isFreePlan?: boolean;
}

export function EmailAlertsForm({
  initialEnabled,
  initialThreshold,
  initialPaused,
  initialFrequency = "immediate",
  initialNotifyOnAll = false,
  initialQuietHoursEnabled = false,
  initialQuietHoursStart = "22:00",
  initialQuietHoursEnd = "08:00",
  isFreePlan = false,
}: EmailAlertsFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSendingTest, setIsSendingTest] = React.useState(false);

  const form = useForm<AlertSettingsFormValues>({
    resolver: zodResolver(alertSettingsSchema),
    defaultValues: {
      emailAlertsEnabled: initialEnabled,
      negativeReviewThreshold: initialThreshold,
      alertsPaused: initialPaused,
      notificationFrequency: initialFrequency,
      notifyOnAllReviews: initialNotifyOnAll,
      quietHoursEnabled: initialQuietHoursEnabled,
      quietHoursStart: initialQuietHoursStart,
      quietHoursEnd: initialQuietHoursEnd,
    },
  });

  React.useEffect(() => {
    form.reset({
      emailAlertsEnabled: initialEnabled,
      negativeReviewThreshold: initialThreshold,
      alertsPaused: initialPaused,
      notificationFrequency: initialFrequency,
      notifyOnAllReviews: initialNotifyOnAll,
      quietHoursEnabled: initialQuietHoursEnabled,
      quietHoursStart: initialQuietHoursStart,
      quietHoursEnd: initialQuietHoursEnd,
    });
  }, [
    form,
    initialEnabled,
    initialThreshold,
    initialPaused,
    initialFrequency,
    initialNotifyOnAll,
    initialQuietHoursEnabled,
    initialQuietHoursStart,
    initialQuietHoursEnd,
  ]);

  const onSubmit = async (values: AlertSettingsFormValues) => {
    if (isFreePlan) {
      toast.error("Email alerts require a Starter plan");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/app/alerts/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error?.message ?? "Failed to update alert settings");
        return;
      }

      toast.success("Notification settings updated");
      form.reset({
        emailAlertsEnabled: result.emailAlertsEnabled,
        negativeReviewThreshold: result.negativeReviewThreshold,
        alertsPaused: result.alertsPaused,
        notificationFrequency: result.notificationFrequency,
        notifyOnAllReviews: result.notifyOnAllReviews,
        quietHoursEnabled: result.quietHoursEnabled,
        quietHoursStart: result.quietHoursStart,
        quietHoursEnd: result.quietHoursEnd,
      });
    } catch (error) {
      console.error("Alert settings update failed:", error);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendTestNotification = async () => {
    if (isFreePlan) {
      toast.error("Email alerts require a Starter plan");
      return;
    }
    setIsSendingTest(true);
    try {
      const response = await fetch("/api/app/alerts/test", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error?.message ?? "Failed to send test notification");
        return;
      }

      toast.success(result.message ?? "Test notification sent!");
    } catch (error) {
      console.error("Test notification failed:", error);
      toast.error("Something went wrong");
    } finally {
      setIsSendingTest(false);
    }
  };

  const emailAlertsEnabled = form.watch("emailAlertsEnabled");
  const quietHoursEnabled = form.watch("quietHoursEnabled");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {isFreePlan && (
          <UpgradeBanner
            feature="Email alerts"
            currentPlan="Free"
            message="Email alerts are a Starter feature"
            variant="subtle"
          />
        )}

        {/* Main Toggle */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Mail className="h-4 w-4" />
            Email Notifications
          </div>
          <FormField
            control={form.control}
            name="emailAlertsEnabled"
            render={({ field }) => (
              <FormItem className="flex items-start gap-3 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isFreePlan}
                  />
                </FormControl>
                <div className="flex flex-col gap-1 leading-none">
                  <FormLabel className={isFreePlan ? "text-muted-foreground" : ""}>
                    Enable email notifications
                  </FormLabel>
                  <FormDescription>
                    Receive emails when new reviews are synced to your inbox.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="alertsPaused"
            render={({ field }) => (
              <FormItem className="flex items-start gap-3 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isFreePlan || !emailAlertsEnabled}
                  />
                </FormControl>
                <div className="flex flex-col gap-1 leading-none">
                  <FormLabel
                    className={
                      isFreePlan || !emailAlertsEnabled ? "text-muted-foreground" : ""
                    }
                  >
                    Pause all notifications
                  </FormLabel>
                  <FormDescription>
                    Temporarily stop all email notifications.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Notification Types */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Bell className="h-4 w-4" />
            Notification Types
          </div>
          <FormField
            control={form.control}
            name="notifyOnAllReviews"
            render={({ field }) => (
              <FormItem className="flex items-start gap-3 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isFreePlan || !emailAlertsEnabled}
                  />
                </FormControl>
                <div className="flex flex-col gap-1 leading-none">
                  <FormLabel
                    className={
                      isFreePlan || !emailAlertsEnabled ? "text-muted-foreground" : ""
                    }
                  >
                    Notify on all reviews
                  </FormLabel>
                  <FormDescription>
                    When disabled, only negative reviews trigger notifications.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="negativeReviewThreshold"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2 rounded-md border p-4">
                <FormLabel
                  className={
                    isFreePlan || !emailAlertsEnabled ? "text-muted-foreground" : ""
                  }
                >
                  Negative review threshold
                </FormLabel>
                <FormDescription>
                  Reviews at or below this rating are considered negative (1-5 stars).
                </FormDescription>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={field.value}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    disabled={isFreePlan || !emailAlertsEnabled}
                    className="w-24"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Frequency */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4" />
            Delivery Frequency
          </div>
          <FormField
            control={form.control}
            name="notificationFrequency"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2 rounded-md border p-4">
                <FormLabel
                  className={
                    isFreePlan || !emailAlertsEnabled ? "text-muted-foreground" : ""
                  }
                >
                  How often to send notifications
                </FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isFreePlan || !emailAlertsEnabled}
                >
                  <FormControl>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {frequencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {frequencyOptions.find((o) => o.value === field.value)?.description}
                </FormDescription>
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Quiet Hours */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4" />
            Quiet Hours
          </div>
          <FormField
            control={form.control}
            name="quietHoursEnabled"
            render={({ field }) => (
              <FormItem className="flex items-start gap-3 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isFreePlan || !emailAlertsEnabled}
                  />
                </FormControl>
                <div className="flex flex-col gap-1 leading-none">
                  <FormLabel
                    className={
                      isFreePlan || !emailAlertsEnabled ? "text-muted-foreground" : ""
                    }
                  >
                    Enable quiet hours
                  </FormLabel>
                  <FormDescription>
                    Pause notifications during specific hours.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          {quietHoursEnabled && emailAlertsEnabled && (
            <div className="flex items-center gap-4 rounded-md border p-4">
              <FormField
                control={form.control}
                name="quietHoursStart"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1">
                    <FormLabel className={isFreePlan ? "text-muted-foreground" : ""}>
                      Start time
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isFreePlan}
                        className="w-32"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <span className="text-muted-foreground mt-6">to</span>
              <FormField
                control={form.control}
                name="quietHoursEnd"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1">
                    <FormLabel className={isFreePlan ? "text-muted-foreground" : ""}>
                      End time
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isFreePlan}
                        className="w-32"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={isSubmitting || isFreePlan}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save settings"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={sendTestNotification}
            disabled={isSendingTest || isFreePlan || !emailAlertsEnabled}
          >
            {isSendingTest ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send test notification
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
