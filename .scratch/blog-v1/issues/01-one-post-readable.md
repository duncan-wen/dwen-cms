# 01: One Post readable at /posts/<slug>

**What to build:** The tracer bullet. A Reader can open a single Published Post at `/posts/<slug>` and read it in a clean single-column layout. Behind it sits the first cut of the content module: it loads Posts from the content directory and validates required frontmatter (title, description, date, at least one Tag) and Slug format. The same module backs a content-check command, and CI runs lint, typecheck, content check, unit tests and smoke tests. Set up the Next.js App Router project with Tailwind and the typography plugin (ADR-0002).

**Blocked by:** None (can start immediately)

**Status:** done

- [x] A sample Post renders at `/posts/<slug>` with its title, date and MDX body
- [x] The content module exposes "list Published Posts" and "resolve a Slug" through a small interface; pages never read content files directly
- [x] Missing required frontmatter or a non-kebab-case Slug fails the content check with an error naming the file, field and rule
- [x] Unit tests run the content module against fixture content directories
- [x] A Playwright smoke test against a production build confirms the Post route answers 200
- [x] A CI workflow runs lint, typecheck, content check, unit tests and smoke tests on every PR

## Comments

Implemented in 3b561cb and 8a5cfcd. The CI workflow exists but hasn't run on GitHub yet; the repo gets a remote in issue 11.
