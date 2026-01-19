export const normalizeCooldownSeconds = (
  value?: number | null
): number | null => {
  if (typeof value !== "number" || value <= 0) {
    return null;
  }

  return value;
};
