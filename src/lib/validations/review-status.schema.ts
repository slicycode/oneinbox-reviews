import { z } from "zod";

export const reviewStatusSchema = z.object({
  status: z.enum(["unread", "responded", "needs_follow_up"]),
});
