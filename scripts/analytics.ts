/**
 * Prints the site's Web Analytics as short tables, through the logged-in Vercel CLI.
 *   pnpm analytics                  the last 30 days: by day, path, referrer, device and country
 *   pnpm analytics --days 14        a shorter window (the Hobby plan keeps 31 days)
 *   pnpm analytics --since 2026-11-16 [--until 2026-12-06]
 *   pnpm analytics --filter "country ne 'TW'"   an OData filter on any dimension
 * How to read the numbers: docs/agents/analytics.md.
 */
import { execFileSync } from "node:child_process";

const PROJECT = "dwen-cms";
const TEAM = "team_dUM4e6kZ7gTvxEVRfG8zGjpi";
const DAY_MS = 24 * 60 * 60 * 1000;
const DIMENSIONS = ["day", "requestPath", "referrerHostname", "deviceType", "country"] as const;

type Row = { visitors: number; pageviews: number; timestamp?: string } & Record<string, string | number>;

const option = (name: string) => {
  const at = process.argv.indexOf(`--${name}`);
  return at === -1 ? undefined : process.argv[at + 1];
};

const until = new Date(option("until") ?? Date.now());
const since = option("since")
  ? new Date(option("since")!)
  : new Date(until.getTime() - Number(option("days") ?? 30) * DAY_MS);
const filter = option("filter");

function aggregate(by: string): Row[] {
  const query = new URLSearchParams({
    projectId: PROJECT,
    teamId: TEAM,
    since: since.toISOString(),
    until: until.toISOString(),
    limit: "30",
    by,
  });
  if (filter) query.set("filter", filter);
  const out = execFileSync("vercel", ["api", `/v1/query/web-analytics/visits/aggregate?${query}`, "--raw"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  // The CLI may print a notice before the JSON.
  return (JSON.parse(out.slice(out.indexOf("{"))) as { data: Row[] }).data;
}

console.log(`${since.toISOString().slice(0, 10)} to ${until.toISOString().slice(0, 10)}${filter ? `, ${filter}` : ""}`);
for (const by of DIMENSIONS) {
  const rows = aggregate(by).filter((row) => row.pageviews > 0);
  const label = (row: Row) => (by === "day" ? String(row.timestamp).slice(0, 10) : String(row[by]) || "(none)");
  const visitors = rows.reduce((sum, row) => sum + row.visitors, 0);
  const pageviews = rows.reduce((sum, row) => sum + row.pageviews, 0);
  console.log(`\n${by}  visitors  pageviews`);
  for (const row of rows) console.log(`${label(row)}  ${row.visitors}  ${row.pageviews}`);
  // A visitor is counted once per day and device, so a day's rows add up; other dimensions count one visitor in several rows.
  if (by === "day")
    console.log(`total  ${visitors}  ${pageviews}  (${(pageviews / Math.max(visitors, 1)).toFixed(2)} per visitor)`);
}
