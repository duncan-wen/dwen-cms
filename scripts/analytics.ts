/**
 * Prints the site's Web Analytics as short tables, through the logged-in Vercel CLI.
 *   pnpm analytics                  the last 30 days: by day, path, referrer, device and country
 *   pnpm analytics --days 14        a shorter window (the Hobby plan keeps 31 days)
 *   pnpm analytics --since 2026-11-16 [--until 2026-12-06]   both days included
 *   pnpm analytics --filter "country ne 'TW'"   an OData filter on any dimension
 * Days are UTC, as the API counts them. How to read the numbers: docs/agents/analytics.md.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const PROJECT = "dwen-cms";
const TEAM = "team_dUM4e6kZ7gTvxEVRfG8zGjpi";
const DAY_MS = 24 * 60 * 60 * 1000;
// Above the 31 days the Hobby plan keeps, so no table is cut short.
const ROW_LIMIT = 100;
const DIMENSIONS = ["day", "requestPath", "referrerHostname", "deviceType", "country"] as const;
const USAGE = "Usage: pnpm analytics [--days <n>] [--since <YYYY-MM-DD>] [--until <YYYY-MM-DD>] [--filter <odata>]";

type Row = { visitors: number; pageviews: number; timestamp?: string } & Record<string, unknown>;

function fail(message: string): never {
  console.error(`${message}\n${USAGE}`);
  process.exit(1);
}

function option(name: string): string | undefined {
  const at = process.argv.indexOf(`--${name}`);
  if (at === -1) return undefined;
  const value = process.argv[at + 1];
  if (value === undefined || value.startsWith("--")) fail(`--${name} needs a value.`);
  return value;
}

function day(name: string): Date | undefined {
  const value = option(name);
  if (value === undefined) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) fail(`--${name} takes a date as YYYY-MM-DD, not "${value}".`);
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) fail(`--${name} isn't a real date: "${value}".`);
  return date;
}

const days = option("days");
if (days !== undefined && !/^[1-9]\d*$/.test(days)) fail(`--days takes a whole number of days, not "${days}".`);
// --until names the last day included, so the window ends at the start of the next one.
const untilDay = day("until");
const until = untilDay ? new Date(untilDay.getTime() + DAY_MS) : new Date();
const since = day("since") ?? new Date(until.getTime() - Number(days ?? 30) * DAY_MS);
if (since >= until) fail("--since must come before --until.");
const filter = option("filter");

const run = promisify(execFile);

async function aggregate(by: string): Promise<Row[]> {
  const query = new URLSearchParams({
    projectId: PROJECT,
    teamId: TEAM,
    since: since.toISOString(),
    until: until.toISOString(),
    limit: String(ROW_LIMIT),
    by,
  });
  if (filter) query.set("filter", filter);
  const { stdout } = await run("vercel", ["api", `/v1/query/web-analytics/visits/aggregate?${query}`, "--raw"]);
  // The body is the last line: the CLI may print a notice before it.
  const body = stdout.trim().split("\n").at(-1) ?? "";
  try {
    return (JSON.parse(body) as { data: Row[] }).data;
  } catch {
    throw new Error(`The Vercel CLI didn't answer with JSON for "${by}":\n${stdout}`);
  }
}

const label = (by: string, row: Row) => {
  if (by === "day") return String(row.timestamp).slice(0, 10);
  const value = row[by];
  return value === undefined || value === null || value === "" ? "(none)" : String(value);
};

const lastDay = new Date(until.getTime() - 1).toISOString().slice(0, 10);
console.log(`${since.toISOString().slice(0, 10)} to ${lastDay} (UTC)${filter ? `, ${filter}` : ""}`);
const tables = await Promise.all(DIMENSIONS.map(aggregate));
DIMENSIONS.forEach((by, i) => {
  const rows = tables[i].filter((row) => row.pageviews > 0);
  console.log(`\n${by}  visitors  pageviews`);
  for (const row of rows) console.log(`${label(by, row)}  ${row.visitors}  ${row.pageviews}`);
  if (rows.length === ROW_LIMIT) console.log(`(cut at ${ROW_LIMIT} rows)`);
  // A visitor is one device on one day, so only the day rows add up to a total.
  if (by === "day") {
    const visitors = rows.reduce((sum, row) => sum + row.visitors, 0);
    const pageviews = rows.reduce((sum, row) => sum + row.pageviews, 0);
    console.log(`total  ${visitors}  ${pageviews}  (${(pageviews / Math.max(visitors, 1)).toFixed(2)} per visitor)`);
  }
});
