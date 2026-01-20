import { z } from "zod";

const toOptionalString = (value: unknown) => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

const toOptionalNumber = (value: unknown) => {
  const raw = toOptionalString(value);
  if (raw === undefined || raw === null || raw === "") {
    return undefined;
  }
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const toOptionalDate = (value: unknown) => {
  const raw = toOptionalString(value);
  if (!raw) {
    return undefined;
  }
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export const reviewStatusValues = ["unread", "responded", "needs_follow_up"] as const;
export type ReviewStatus = (typeof reviewStatusValues)[number];

export const sortByValues = [
  "date_newest",
  "date_oldest",
  "rating_highest",
  "rating_lowest",
] as const;
export type SortBy = (typeof sortByValues)[number];

export const reviewFiltersSchema = z.object({
  ratingMin: z.preprocess(toOptionalNumber, z.number().min(1).max(5).optional()),
  ratingMax: z.preprocess(toOptionalNumber, z.number().min(1).max(5).optional()),
  dateFrom: z.preprocess(toOptionalDate, z.date().optional()),
  dateTo: z.preprocess(toOptionalDate, z.date().optional()),
  query: z.preprocess(toOptionalString, z.string().trim().optional()),
  status: z.preprocess(
    toOptionalString,
    z.enum(reviewStatusValues).optional()
  ),
  sortBy: z.preprocess(
    toOptionalString,
    z.enum(sortByValues).optional()
  ),
});

export type ReviewFiltersInput = z.infer<typeof reviewFiltersSchema>;
