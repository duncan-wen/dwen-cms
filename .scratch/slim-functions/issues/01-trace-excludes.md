# 01: Trace excludes

**What to build:** `outputFileTracingExcludes` for build-time-only files, the preview check script, and the before/after sizes. See `../spec.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `next.config` excludes the spec's list from every route
- [ ] The local build's largest traced route drops from about 77 MB, with the before/after per route in the PR body
- [ ] The preview check script passes on the PR's Vercel preview: every page and image 200, unknown Post 404, bad feedback 400
- [ ] sharp is excluded only if the preview check passes without it
