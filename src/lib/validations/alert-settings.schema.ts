import { z } from "zod";

export const alertSettingsSchema = z.object({
  emailAlertsEnabled: z.boolean(),
});
