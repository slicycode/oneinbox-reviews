import { z } from "zod";

export const reviewResponseSchema = z.object({
  response: z
    .string()
    .trim()
    .min(1, "Response is required")
    .max(2000, "Response is too long"),
});
