// Every date a Reader or a feed sees goes through here. Dates arrive as YYYY-MM-DD strings.

const dateFormat = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long", timeZone: "UTC" });

/** Formats a YYYY-MM-DD date for Readers, e.g. 2026年10月1日. */
export function formatDate(date: string): string {
  return dateFormat.format(dateValue(date));
}

/** The date as a Date at midnight UTC: for the RSS feed, which writes its own date format. */
export function dateValue(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

/** The ISO date, e.g. 2026-11-01: shown in Post headers and cards, and every `<time dateTime>`. */
export function isoDate(date: string): string {
  return date.slice(0, 10);
}

/** The month and day, e.g. 11-01: shown in the Post list under its year heading. */
export function monthDay(date: string): string {
  return date.slice(5, 10);
}

/** The year, e.g. 2026: the Post list's year headings. */
export function year(date: string): string {
  return date.slice(0, 4);
}
