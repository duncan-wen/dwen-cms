# 04: Production check

**What to build:** Once the integration branch is merged, confirm on the production site that crawlers get what the spec promises, then the Owner confirms Search Console reports no structured-data errors. See `../spec.md`.

**Blocked by:** 01, 02, 03

**Status:** ready-for-agent

- [ ] `pnpm prod:check` passes for `/`, `/about` and a Post path
- [ ] `curl` on production: `/robots.txt` answers 200 with the sitemap line; the home page, About Page and a Post page each carry their JSON-LD
- [ ] About a week after launch, the Owner checks Search Console's enhancement reports and finds no structured-data errors (ticked only when the Owner says OK)
