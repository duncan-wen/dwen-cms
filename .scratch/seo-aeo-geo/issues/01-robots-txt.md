# 01: robots.txt

**What to build:** `/robots.txt` answers 200 with one rule allowing every crawler, AI training and search crawlers alike, and names the sitemap's absolute URL on the configured base URL. Today it answers 404. See `../spec.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `/robots.txt` answers 200 as text
- [ ] One rule allows all user agents; no per-bot groups
- [ ] It names the sitemap on the configured base URL
- [ ] Smoke covers the three points above
