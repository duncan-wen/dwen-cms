const dateFormat = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long", timeZone: "UTC" });

/** Formats a YYYY-MM-DD date for Readers, e.g. 2026年10月1日. */
export function formatDate(date: string): string {
  return dateFormat.format(new Date(`${date}T00:00:00Z`));
}
