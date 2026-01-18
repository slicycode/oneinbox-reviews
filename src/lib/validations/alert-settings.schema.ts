import { z } from "zod";

export const alertSettingsSchema = z.object({
  emailAlertsEnabled: z.boolean(),
  negativeReviewThreshold: z.number().int().min(1).max(5),
  alertsPaused: z.boolean(),
});
