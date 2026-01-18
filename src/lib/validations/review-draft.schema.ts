import { z } from "zod";

export const reviewDraftSchema = z.object({
  response: z
    .string()
    .trim()
    .min(1, "Draft is required")
    .max(2000, "Draft is too long"),
});
