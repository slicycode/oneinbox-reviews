export const getSyncResetUpdate = (now: Date) => ({
  status: "stale" as const,
  lastError: null as string | null,
  updatedAt: now,
});
