"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import { alertSettingsSchema } from "@/lib/validations/alert-settings.schema";

type AlertSettingsFormValues = {
  emailAlertsEnabled: boolean;
  negativeReviewThreshold: number;
  alertsPaused: boolean;
};

interface EmailAlertsFormProps {
  initialEnabled: boolean;
  initialThreshold: number;
  initialPaused: boolean;
}

export function EmailAlertsForm({
  initialEnabled,
  initialThreshold,
  initialPaused,
}: EmailAlertsFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<AlertSettingsFormValues>({
    resolver: zodResolver(alertSettingsSchema),
    defaultValues: {
      emailAlertsEnabled: initialEnabled,
      negativeReviewThreshold: initialThreshold,
      alertsPaused: initialPaused,
    },
  });

  React.useEffect(() => {
    form.reset({
      emailAlertsEnabled: initialEnabled,
      negativeReviewThreshold: initialThreshold,
      alertsPaused: initialPaused,
    });
  }, [form, initialEnabled, initialThreshold, initialPaused]);

  const onSubmit = async (values: AlertSettingsFormValues) => {
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

      toast.success("Alert settings updated");
      form.reset({
        emailAlertsEnabled: result.emailAlertsEnabled,
        negativeReviewThreshold: result.negativeReviewThreshold,
        alertsPaused: result.alertsPaused,
      });
    } catch (error) {
      console.error("Alert settings update failed:", error);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <p className="text-xs text-muted-foreground">
          Alerts are off by default. Enable to receive emails when new reviews are
          ingested.
        </p>
        <FormField
          control={form.control}
          name="emailAlertsEnabled"
          render={({ field }) => (
            <FormItem className="flex items-start gap-3 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="flex flex-col gap-1 leading-none">
                <FormLabel>Email alerts for new reviews</FormLabel>
                <FormDescription>
                  Receive an email whenever new reviews are ingested.
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
                />
              </FormControl>
              <div className="flex flex-col gap-1 leading-none">
                <FormLabel>Pause alerts</FormLabel>
                <FormDescription>
                  Temporarily stop sending any alert emails.
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
              <FormLabel>Negative review threshold</FormLabel>
              <FormDescription>
                Send alerts only for reviews rated at or below this value.
              </FormDescription>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={field.value}
                  onChange={(event) => field.onChange(Number(event.target.value))}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save alert settings"
          )}
        </Button>
      </form>
    </Form>
  );
}
