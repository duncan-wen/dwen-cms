# 11: GitHub repo, Vercel and Analytics

**What to build:** The Owner creates the GitHub private repo, pushes, connects it to Vercel and enables Vercel Analytics. After this, every PR gets a preview URL, merging to main deploys production, and CI runs for real. Consider `/wizard` to script the manual steps.

**Blocked by:** 01

**Status:** done

- [x] The GitHub private repo exists and main is pushed
- [x] Vercel deploys main to production and each PR to a preview URL
- [x] CI runs on a test PR and reports pass/fail
- [x] The base URL configuration is set to the Vercel production domain
- [x] Vercel Analytics records visits

## Comments

- 2026-11-01: The Owner created the repo, imported it into Vercel, set `SITE_URL` (Production only) and enabled Analytics by hand. PR #1 added `<Analytics />` and `siteUrl()`; it was the test PR: CI passed and Vercel posted a preview URL. Analytics recorded visits.
