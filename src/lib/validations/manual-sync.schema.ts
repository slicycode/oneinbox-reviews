import { z } from "zod";

export const manualSyncSchema = z.object({
  userId: z.string().min(1),
  provider: z.string().min(1),
});
