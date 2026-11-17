# Spec: Slim functions and fewer deployments

**Status:** ready-for-agent

## Problem Statement

Vercel's Functions Storage hit 10.09 GB of the Hobby plan's 10 GB on 2026-11-17. The project had 36 deployments, all from that day (retention already removes them after 7 days), each holding 3 function bundles of about 90 MB. Every page is prerendered (`dynamicParams = false` on each dynamic route), so at runtime the functions only answer 404s, the feedback API and the proxy, yet each one traces files only the build needs: the content (`content/posts`, 8.8 MB), the content check's jsdom, mermaid and elkjs (about 10 MB), Shiki's language grammars (8.6 MB), sharp's libvips (18.7 MB) and stray folders such as `test-results/` (3.7 MB). And every PR builds a deployment, including PRs that only change specs, docs or skills.

## Solution

- `next.config`'s `outputFileTracingExcludes` keeps build-time-only files out of every function.
- Vercel skips the build when a push changes only `.scratch/`, `docs/`, `.claude/` or the root's `*.md`.
- Preview deployments, and failed or cancelled ones, are kept 1 day instead of 7 or 30; production keeps 7 days and at least 10.
- Then the day's old deployments are deleted, keeping the one production serves and the 3 newest production deployments.

## User Stories

1. As the Owner, I want the site to stay inside the Hobby plan's Functions Storage, so it isn't paused or billed.
2. As a Reader, I want every page, image, 404 and the feedback form to work as before.

## Implementation Decisions

- **Excludes**: for every route (`"*"`): `content/**`, `e2e/**`, `test-results/**`, `.scratch/**`, `node_modules/jsdom/**`, `node_modules/mermaid/**`, `node_modules/elkjs/**`, `node_modules/@shikijs/langs/**`, `node_modules/@img/**` and `node_modules/sharp/**` (pnpm's real paths under `node_modules/.pnpm/` too). sharp goes only if the preview check below passes with it out; otherwise it stays and the PR says so.
- **Preview check**, on the PR's Vercel preview with the protection bypass header: every Published Post, its OG image, cover and body images, `/`, `/posts`, `/tags`, each tag and Series page, `/about`, `/feed.xml`, `/sitemap.xml`, `/robots.txt`, `/icon` and `/covers/<slug>.svg` answer 200; `/posts/no-such-post` answers 404; `POST /api/feedback` with a bad body answers 400, not 500. A script under `scripts/` runs it, so it can be rerun.
- **Measure**: the local build's traced size per route before and after, in the PR body.
- **Ignore build step**: `vercel.json`'s `ignoreCommand` runs `scripts/vercel-ignore-build.sh`, which exits 0 (skip) when every file changed since `VERCEL_GIT_PREVIOUS_SHA` (or `HEAD^` when unset) is under `.scratch/`, `docs/`, `.claude/` or a root `*.md`, and 1 (build) otherwise or when it can't tell. `docs/agents/shipping.md` says a docs-only PR shows the Vercel check as skipped, and `check` is the one to wait for.
- **Retention** (after the code merges): `PATCH /v9/projects/dwen-cms` `deploymentExpiration` preview 1 day, canceled and errored 1 day, production unchanged.
- **Cleanup** (after retention): delete every deployment except the one production serves and the 3 newest production ones.

## Testing Decisions

- The ignore script is unit-tested as a pure decision (list of changed paths in, build or skip out) in `src/`, with the shell wrapper only feeding it `git diff --name-only`.
- The preview check is the excludes' test; its output goes in the PR body.

## Out of Scope

- Moving image generation or MDX compiling elsewhere; changing the plan.

## Comments

- Ticket 02: no shell wrapper. Vercel runs the ignore command before installing dependencies, on Node 26, which runs TypeScript directly, so the decision and its git call are one file, `src/deploy/ignore-build.ts`. A branch's first deployment (no `VERCEL_GIT_PREVIOUS_SHA`) always builds, since its last commit alone may hide earlier ones.

## Further Notes

- Agreed with the Owner on 2026-11-17 in chat. Usage after the cleanup goes under Comments.
