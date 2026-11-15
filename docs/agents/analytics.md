# Web Analytics

How to read the site's Vercel Web Analytics, and what its numbers do and don't say.

**Query**: `pnpm analytics` prints the last 30 days by day, path, referrer, device and country (`--days <n>`, `--since <date> --until <date>`, `--filter "country ne 'TW'"`). It calls the logged-in CLI, `vercel api /v1/query/web-analytics/visits/aggregate`; the Vercel MCP answers 403 for this team. For two dimensions at once, call that endpoint with `by` twice.

**Limits of the Hobby plan**: 31 days of data, so numbers needed later are written down before they age out. No custom events (the endpoint answers 402), so a click can't be counted. Nothing measures time on a page or scroll depth.

**Reading the numbers**:

- A **visitor** is one device on one day. Someone who comes back the next day, or opens the site on a phone and a computer, counts again. Only the `day` rows add up to a total.
- A **referrer** is recorded on the page a visit lands on and on no later page. A referrer's pageviews are landings, so they can't show whether those Readers went on to a second page. The `(none)` row holds every later page as well as direct visits.
- The analytics script sends nothing from a headless or automated browser (`navigator.webdriver`, or a user agent containing `Headless`). Playwright, `pnpm shots` and `pnpm smoke` add no pageviews. To watch the script's own request in Playwright, launch with `--disable-blink-features=AutomationControlled` and an ordinary user agent, and compare against a browser that should send one: a check where neither browser sends anything proves nothing.
- The Owner's devices are left out by the Analytics opt-out at `/owner/analytics`, set per browser since 2026-11-15. Numbers before that date are mostly the Owner's own visits.
- At this traffic (about 130 visitors in 16 days), a difference between two periods shows a direction and no more.

**From a cloud routine**: a scheduled cloud agent has no Vercel login, so it can't run this. Leave a dated note for the next local session instead.
