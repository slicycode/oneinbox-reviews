import { z } from "zod";

export const notificationFrequencyValues = [
  "immediate",
  "daily_digest",
  "weekly_digest",
] as const;

export const alertSettingsSchema = z.object({
  emailAlertsEnabled: z.boolean(),
  negativeReviewThreshold: z.number().int().min(1).max(5),
  alertsPaused: z.boolean(),
  notificationFrequency: z.enum(notificationFrequencyValues).optional(),
  notifyOnAllReviews: z.boolean().optional(),
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)")
    .optional(),
  quietHoursEnd: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)")
    .optional(),
});

export type AlertSettingsInput = z.infer<typeof alertSettingsSchema>;
