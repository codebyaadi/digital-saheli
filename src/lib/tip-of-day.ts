/**
 * Tip of the day: a stable, non-random pick that changes every day and on the hour,
 * so the home page and the API always agree without storing anything.
 */
export function pickTipOfDay<T extends { id: string }>(tips: T[], salt = 0): T | null {
  if (tips.length === 0) return null;
  const now = new Date();
  const dayIndex = Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 86_400_000);
  const idx = ((dayIndex + salt) % tips.length + tips.length) % tips.length;
  return tips[idx];
}