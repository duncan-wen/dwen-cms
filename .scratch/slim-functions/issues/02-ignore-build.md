# 02: Skip builds for docs-only pushes

**What to build:** `ignoreCommand` and its decision, and the shipping note. See `../spec.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] The decision (changed paths in, build or skip out) is unit-tested: docs-only skips; any other path, or no list, builds
- [ ] `vercel.json` runs `scripts/vercel-ignore-build.sh` as `ignoreCommand`
- [ ] `docs/agents/shipping.md` says a docs-only PR's Vercel check is skipped and `check` is the one to wait for
