import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().max(200).optional().default(""),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

/**
 * Parse pagination params from URLSearchParams
 */
export function parsePaginationParams(searchParams: URLSearchParams): PaginationInput {
  const result = paginationSchema.safeParse({
    page: searchParams.get("page") ?? 1,
    limit: searchParams.get("limit") ?? 10,
    search: searchParams.get("search") ?? "",
  });

  if (!result.success) {
    // Return safe defaults if validation fails
    return { page: 1, limit: 10, search: "" };
  }

  return result.data;
}
