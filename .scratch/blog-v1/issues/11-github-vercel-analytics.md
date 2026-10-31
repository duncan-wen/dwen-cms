# 11: GitHub repo, Vercel and Analytics

**What to build:** The Owner creates the GitHub private repo, pushes, connects it to Vercel and enables Vercel Analytics. After this, every PR gets a preview URL, merging to main deploys production, and CI runs for real. Consider `/wizard` to script the manual steps.

**Blocked by:** 01

**Status:** ready-for-human

- [ ] The GitHub private repo exists and main is pushed
- [ ] Vercel deploys main to production and each PR to a preview URL
- [ ] CI runs on a test PR and reports pass/fail
- [ ] The base URL configuration is set to the Vercel production domain
- [ ] Vercel Analytics records visits
