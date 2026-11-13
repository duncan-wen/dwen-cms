// When a platform's access token needs attention. Dates arrive as YYYY-MM-DD, the day the token was made.

const DAY_MS = 86_400_000;

/** A token's age in whole days on `now`. */
export function tokenAgeDays(date: string, now: Date): number {
  return Math.floor((now.getTime() - Date.parse(date)) / DAY_MS);
}

/**
 * What to do about a token made on `date` that lasts `lifetimeDays`: `expired` once it has run
 * out, else `warn` from ten days before, else `ok`. `daysLeft` counts down to expiry.
 */
export function tokenStatus(
  date: string,
  now: Date,
  lifetimeDays: number,
): { state: "ok" | "warn" | "expired"; daysLeft: number } {
  const daysLeft = lifetimeDays - tokenAgeDays(date, now);
  return { state: daysLeft <= 0 ? "expired" : daysLeft <= 10 ? "warn" : "ok", daysLeft };
}

/** Whether a Threads token can be refreshed now: at least a day old and not yet expired. */
export function canRefreshThreadsToken(date: string, now: Date, lifetimeDays: number): boolean {
  return tokenAgeDays(date, now) >= 1 && tokenStatus(date, now, lifetimeDays).state !== "expired";
}
