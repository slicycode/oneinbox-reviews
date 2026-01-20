/**
 * Utility functions for consistent plan limit formatting across the app
 */

/**
 * Format review count with limit
 * @param count - Current review count
 * @param limit - Max reviews (null = unlimited)
 * @returns Formatted string like "45/50" or "123 (unlimited)"
 */
export function formatReviewCount(count: number, limit: number | null): string {
  if (limit === null) {
    return `${count.toLocaleString()}`;
  }
  return `${count.toLocaleString()}/${limit.toLocaleString()}`;
}

/**
 * Format review limit for display
 * @param limit - Max reviews (null = unlimited)
 * @returns Formatted string like "50 reviews" or "Unlimited"
 */
export function formatReviewLimit(limit: number | null): string {
  if (limit === null) {
    return "Unlimited";
  }
  return `${limit.toLocaleString()} reviews`;
}

/**
 * Format data retention days
 * @param days - Number of retention days
 * @returns Formatted string like "30 days" or "1 year"
 */
export function formatRetentionDays(days: number): string {
  if (days >= 365) {
    const years = Math.floor(days / 365);
    return years === 1 ? "1 year" : `${years} years`;
  }
  return `${days} days`;
}

/**
 * Format usage percentage
 * @param used - Amount used
 * @param limit - Max limit (null = unlimited)
 * @returns Percentage number (0-100) or null if unlimited
 */
export function calculateUsagePercent(
  used: number,
  limit: number | null,
): number | null {
  if (limit === null) {
    return null;
  }
  return Math.min(100, Math.round((used / limit) * 100));
}

/**
 * Get usage status based on percentage
 * @param percent - Usage percentage
 * @returns Status: "low", "medium", "high", or "critical"
 */
export function getUsageStatus(
  percent: number | null,
): "low" | "medium" | "high" | "critical" | "unlimited" {
  if (percent === null) {
    return "unlimited";
  }
  if (percent >= 100) {
    return "critical";
  }
  if (percent >= 80) {
    return "high";
  }
  if (percent >= 50) {
    return "medium";
  }
  return "low";
}

/**
 * Format usage with status message
 * @param used - Amount used
 * @param limit - Max limit (null = unlimited)
 * @returns Object with formatted text and status
 */
export function formatUsageWithStatus(
  used: number,
  limit: number | null,
): { text: string; status: ReturnType<typeof getUsageStatus> } {
  const percent = calculateUsagePercent(used, limit);
  const status = getUsageStatus(percent);

  if (limit === null) {
    return {
      text: `${used.toLocaleString()} reviews`,
      status,
    };
  }

  return {
    text: `${used.toLocaleString()} of ${limit.toLocaleString()} reviews`,
    status,
  };
}
