# 02: Skip builds for docs-only pushes

**What to build:** `ignoreCommand` and its decision, and the shipping note. See `../spec.md`.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] The decision (changed paths in, build or skip out) is unit-tested: docs-only skips; any other path, or no list, builds
- [x] `vercel.json` runs `node src/deploy/ignore-build.ts` as `ignoreCommand`
- [x] `docs/agents/shipping.md` says a docs-only PR's Vercel check is skipped and `check` is the one to wait for
