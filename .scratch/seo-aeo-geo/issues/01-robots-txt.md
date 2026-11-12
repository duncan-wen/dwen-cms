# 01: robots.txt

**What to build:** `/robots.txt` answers 200 with one rule allowing every crawler, AI training and search crawlers alike, and names the sitemap's absolute URL on the configured base URL. Today it answers 404. See `../spec.md`.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] `/robots.txt` answers 200 as text
- [x] One rule allows all user agents; no per-bot groups
- [x] It names the sitemap on the configured base URL
- [x] Smoke covers the three points above
