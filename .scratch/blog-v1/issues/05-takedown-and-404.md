# 05: Takedown and not-found

**What to build:** The Owner takes down a Post by deleting it and adding its Slug to the taken-down Slug list. Its URL then answers 410 Gone with a short explanation page. A taken-down Slug can never be reused as a current or previous Slug. URLs that never existed get a helpful 404 page.

**Blocked by:** 04

**Status:** done

- [x] The taken-down Slug list is a data file in the content directory
- [x] Resolving a taken-down Slug returns a Takedown marker
- [x] Reusing a taken-down Slug fails the content check
- [x] A taken-down Slug answers 410 with an explanation page; an unknown URL answers 404 with a way back to content
- [x] Unit tests cover resolution and the reuse rule; smoke tests cover 410 and 404

## Comments

The taken-down Slug list is optional: a missing file means no Slug is taken down. `tags.yml` stays the only required data file, so existing fixture directories need no new file.

**Owner decision needed before `/implement` (issue-04 retro):** the smoke suite builds the real `content/`, so testing 410 needs a real taken-down Slug, and that Slug can never be used again. Issue 04 already put a made-up previous Slug (`mdx-in-git`) into a Published Post for the same reason. Pick one, then set Status back to `ready-for-agent`:

- **(a) Smoke fixture content.** `src/content/site-content.ts` reads a `CONTENT_DIR` override; the smoke suite builds `e2e/content/` instead of `content/`, and `mdx-in-git` moves out of the real Post. CI pays one extra build.
- **(b) Real content.** Smoke tests keep using `content/`; any Slug added only for a smoke test is named in the PR body.

**Owner decision: (a).** Build it as part of this ticket:

- `src/content/site-content.ts` reads `CONTENT_DIR` (default `content/`); `pnpm smoke` builds with `CONTENT_DIR=e2e/content`.
- `e2e/content/` holds every Post, previous Slug and taken-down Slug the smoke suite needs. Smoke tests and `playwright.config.ts` stop naming real Posts.
- Remove `previousSlugs: [mdx-in-git]` from `content/posts/why-mdx-in-git/index.mdx`; it was only there for the issue-04 smoke test.
- CI keeps its `pnpm build` of real `content/` (the warnings check), then runs `pnpm smoke` instead of `pnpm test:smoke`.
