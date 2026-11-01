# Spec: dwen-cms v1, Posts and Pages

**Status:** done

## Problem Statement

The Owner wants a personal tech-brand site that shows prospective employers and clients what they can do, with fellow engineers as a secondary audience. The Owner doesn't want to write every word by hand: Writing Agents should draft and revise content, while the Owner keeps sole control over what gets Published. Hosted platforms like Hashnode or Ghost keep content out of the repo, where agents work best. They also can't embed the interactive Demos planned for later.

## Solution

A Traditional Chinese site built with Next.js on Vercel, with Posts and Pages stored as MDX in the repo (ADR-0001, ADR-0002). A Writing Agent drafts content on a branch and opens a pull request; that open PR is the Draft. The Owner reviews the Vercel preview and merges, and merging is what makes content Published. A content module validates every Post and Page against the glossary's rules (Slugs, Tags, Corrections vs. Revisions, Takedowns), and CI blocks any PR that breaks them. v1 ships Posts, Pages, Tag listings, feeds and social previews; Demos come in phase 2, but v1 reserves room for them.

## User Stories

### Reader

1. As a Reader, I want the home page to introduce the Owner briefly and show the latest Posts, so that I quickly understand who they are and what they write about.
2. As a Reader, I want a list of all Published Posts, newest first, so that I can browse everything the Owner has written.
3. As a Reader, I want each Post in a list to show its title, date, description and Tags, so that I can decide what to read.
4. As a Reader, I want to read a Post at a short, readable English URL, so that links are easy to share and don't turn into percent-encoded noise.
5. As a Reader, I want Post bodies typeset for comfortable long-form reading in Traditional Chinese, so that technical articles are pleasant to read.
6. As a Reader, I want code blocks with syntax highlighting, so that technical examples are easy to follow.
7. As a Reader, I want images in Posts to load fast and size correctly on my device, so that pages don't jump or waste data.
8. As a Reader, I want to click a Tag and see every Post with that Tag, so that I can follow a topic I care about.
9. As a Reader, I want a list of all Tags, so that I can see which topics the Owner covers.
10. As a Reader, I want to see 「更新於」 with a short note on a Post that has had a Revision, so that I know the content changed since it was first published.
11. As a Reader, I want Corrections, such as a typo or a broken link, not to show 「更新於」, so that it only appears when something meaningful changed.
12. As a Reader, I want an old link to a Post whose Slug changed to take me to the Post's new URL, so that bookmarks and shared links keep working.
13. As a Reader, I want a link to a Post that was taken down to tell me clearly that it was removed, so that I'm not left wondering whether the site is broken.
14. As a Reader, I want an About page, so that I can learn about the Owner's background and how they use AI to produce the site.
15. As a Reader, I want the site to follow my system's dark or light preference, with a manual toggle, so that it's comfortable to read at any time.
16. As a Reader, I want the site to work well on my phone, so that I can read Posts on the go.
17. As a Reader, I want an RSS feed, so that I can follow new Posts in my feed reader.
18. As a Reader, I want a link to a Post shared on social media to show a preview image with the Post's title, so that I can tell what it's about before clicking.
19. As a Reader, I want a sensible "not found" page for URLs that never existed, so that I can find my way back to the content.
45. As a Reader, I want workflow and architecture diagrams in a Post drawn crisply in the site's colours, following the theme and readable on my phone, so that long tutorials are easy to follow.

### Owner

20. As the Owner, I want content to become Published only when I merge a pull request, so that nothing reaches Readers without my Review.
21. As the Owner, I want every pull request to get a preview URL, so that I can review a Draft exactly as Readers will see it, including on my phone.
22. As the Owner, I want CI to fail a pull request whose content breaks the rules, so that I don't have to catch formatting mistakes by eye.
23. As the Owner, I want a clear, readable error message when content is invalid, so that I or a Writing Agent can resolve it quickly.
24. As the Owner, I want to approve new Tags explicitly, so that the Tag list stays small and consistent instead of growing with near-duplicates.
25. As the Owner, I want Tag names forced to lowercase English, so that "RAG", "rag" and 「檢索增強生成」 don't become three different Tags.
26. As the Owner, I want to change a Post's Slug without breaking old links, so that I can replace a poor URL after publishing.
27. As the Owner, I want the build to fail if an old Slug collides with another Post's current Slug, so that redirects can never point to the wrong Post.
28. As the Owner, I want to take down a Post by deleting it and recording its Slug as taken down, so that its URL answers 410 and search engines drop it.
29. As the Owner, I want the build to fail if a taken-down Slug is reused by a Published Post, so that a removed Post's URL isn't silently recycled.
30. As the Owner, I want to mark a change as a Revision with a short note, so that Readers see meaningful changes explained.
31. As the Owner, I want Corrections to need no extra metadata, so that small Corrections stay cheap.
32. As the Owner, I want images stored next to the Post that uses them, so that taking down a Post removes its images too.
33. As the Owner, I want a sitemap generated from the Published content, so that search engines discover every Post and Page.
34. As the Owner, I want visit analytics, so that I can see which Posts reach Readers.
35. As the Owner, I want the site's base URL configurable, so that switching to a custom domain later doesn't require code changes.
36. As the Owner, I want the About page to state that content is drafted with AI and reviewed by me, so that Readers get one honest, site-wide disclosure.
37. As the Owner, I want the `/demos` area and a way to embed components in Posts reserved now, so that phase-2 Demos fit in without restructuring the site.

### Writing Agent

38. As a Writing Agent, I want a `write-post` skill describing the Owner's voice, so that my drafts sound like the Owner rather than a generic AI.
39. As a Writing Agent, I want the skill to spell out the frontmatter fields and file layout, so that my Drafts pass validation on the first try.
40. As a Writing Agent, I want to run the content validation locally before opening a PR, so that I catch my own mistakes.
41. As a Writing Agent, I want the approved Tag list in the repo, so that I pick existing Tags and only propose a new one with a reason in the PR.
42. As a Writing Agent, I want clear rules for telling a Correction from a Revision, so that I label changes the way the Owner expects.
43. As a Writing Agent, I want the rule "one concern per pull request", so that content changes never get mixed with code or styling changes.
44. As a Writing Agent, when a Post needs a new MDX component, I want to open a separate PR for the component first, so that the Owner reviews code and content separately.
46. As a Writing Agent, I want to draw a diagram by writing Mermaid in a Post, and have the content check tell me when the site can't draw it, so that I never ship a broken diagram.
47. As a Writing Agent, I want `pnpm promo <slug>` to turn a Post into promo images (文宣圖) from brand templates, so that I can attach ready-to-post images to the Draft PR without an AI image model.

## Implementation Decisions

### Content module (the main seam)

- One deep module owns all content rules. Given a content directory, it loads, validates and indexes every Post and Page and exposes a small query interface:
  - list Published Posts, newest first
  - resolve a Slug: returns the Post, a redirect to the current Slug (for an old Slug), a Takedown marker, or not found
  - list Posts by Tag
  - list all Tags with their Post counts (only Tags at least one Post carries; an approved Tag no Post uses has no listing or Tag page)
  - get a Page by its name
- Everything that renders content goes through this interface: pages, RSS, sitemap and OG images. No page reads content files directly.
- The same module backs a content-check command used locally and in CI, so validation runs without a full Next.js build.

### Content model

- Post frontmatter:
  - title (required)
  - description (required; used for listings, meta and OG)
  - date (required)
  - Tags (one or more, each in the approved Tag list)
  - optional cover image
  - optional list of previous Slugs
  - optional Revision entries, each with a date and a short note
  - optional `promo`, what its promo images show: a `template` (`contour`, the default; `flow`; `terminal`), `titleLines` (where the title breaks), key `points`, flow's `steps` (a name and an optional command) and terminal's `lines` (a command and an optional comment)
- A Post's Slug is its folder name.
- There is no draft field: a Draft is an unmerged PR, and everything on the main branch is Published.
- A Post's latest Revision (its date and note, shown as 「更新於」) is the Revision entry with the most recent date; Corrections leave no trace in frontmatter.
- Page frontmatter: title and description.
- The approved Tag list and the taken-down Slug list are each a small data file in the content directory, both changed only through PRs.

### Validation rules (enforced by the content module)

- Slugs and previous Slugs are lowercase English kebab-case.
- Tags are lowercase and appear in the approved Tag list.
- No previous Slug equals any current Slug, and no two Posts claim the same previous Slug.
- No taken-down Slug is used as a current or previous Slug.
- Revision dates are on or after the Post's date.
- Referenced images exist next to the Post.
- Every ```` ```mermaid ```` block parses as Mermaid, is a diagram type the site draws (flowchart, state, sequence, class, ER or xychart), gives a flowchart's nodes ASCII IDs (labels may be Chinese: `review{審閱}`), and draws with the site's renderer. Errors name the block by its position and line.
- `promo` is a mapping; its `template` is a known template; `titleLines` split the title without changing its words; `points`, if given, list at least one non-empty point; flow needs at least one step and terminal at least one line, each with non-empty text, and an optional command or comment, if given, is non-empty too; `steps` and `lines` appear only on their own template.
- Errors name the file, the field and the rule that failed.

### Routing and HTTP behaviour

- Routes:
  - home
  - Post list
  - a Post at `/posts/<slug>`
  - Tag index
  - a Tag's Posts at `/tags/<tag>`
  - About at `/about`
  - RSS feed
  - sitemap
- Post pages are statically generated.
- Old Slugs answer with a permanent redirect (301/308) to the current Slug.
- Taken-down Slugs answer 410 Gone with a short explanation page.
- `/demos` is reserved but not built in v1.

### Rendering

- MDX goes through a single component map, the extension point where phase-2 Demo components will plug in. v1 provides an image component (optimised, works with co-located images), a callout, and syntax-highlighted code blocks.
- Styling uses Tailwind with the typography plugin, in a minimal single-column reading layout. Dark mode follows the system preference, with a manual toggle that remembers the Reader's choice.
- Each Post gets an OG image generated at build time with its title. It uses a font that renders Traditional Chinese correctly.
- A ```` ```mermaid ```` block renders through the component map as an SVG drawn at build time in plain Node (`beautiful-mermaid`; Vercel's build has no browser), coloured by the theme's tokens so the toggle restyles it without a reload. A diagram wider than the reading column shrinks to fit it, but never so far that its labels drop below the body's small text; wider than that, it scrolls inside its own box, so the page never scrolls sideways.

### Promo images

- `pnpm promo <slug>…` draws each Post at 1200×630, 1080×1080 and 1080×1350 from the template its `promo` frontmatter picks, in the site's colour tokens and fonts, and writes the PNGs plus a contact sheet to the gitignored `promo/`. It runs on a workstation or in CI with Playwright, not in the Vercel build, and needs no AI model or API key.
- Templates: **contour** (the Post's generated cover beside or above the title), **flow** (numbered steps as the hero) and **terminal** (dark tokens, a terminal box of commands).
- Every image shows the title, the key points (else the description) and the byline. Each of `titleLines` stays on one line, the title shrinking until the longest fits; without them the title wraps. Promo images leave out the 「溫」 seal.
- The site's base URL comes from configuration and is used for canonical URLs, RSS, sitemap and OG.

### Platform

- The repo is a GitHub private repo; Vercel deploys the main branch to production and every PR to a preview URL (ADR-0002).
- CI runs on every PR: lint, typecheck, content check, unit tests and the built-site smoke tests.
- Vercel Analytics is enabled. There are no comments.
- The site stays on the default Vercel domain until a custom domain is chosen.

### write-post skill

- A project skill for Writing Agents covering:
  - the Owner's voice
  - the frontmatter and file layout
  - choosing Tags from the approved list (with a stated reason when proposing a new one)
  - telling a Correction from a Revision and how to record a Revision
  - one concern per PR
  - running the content check before opening a PR
- The voice section is derived from 2–3 sample texts the Owner will provide. The rest can be written before they arrive.

## Testing Decisions

- Good tests check external behaviour through the public interface (queries in, results or errors out), never internal helpers or file-parsing details. A test should keep passing through any refactor that preserves behaviour.
- **Seam 1, the content module (primary):** unit tests run against small fixture content directories, one fixture per rule where practical. Cover:
  - valid loading and sorting
  - Tag filtering and counts
  - Slug resolution for current, previous, taken-down and unknown Slugs
  - every validation rule, with readable errors
  - the latest Revision derived from a Post's Revision entries
- **Seam 2, the built site (supporting):** a small Playwright smoke suite runs against a production build. It checks that:
  - each route answers 200
  - an old Slug redirects to the current Slug
  - a taken-down Slug answers 410
  - an unknown URL answers 404
  - Reader-facing text shown only under a content condition (such as 「更新於」 for a Post with a Revision) appears exactly when that condition holds
  - RSS, sitemap and an OG image are served with the right content types
  - a Mermaid block draws an SVG whose colours follow the theme toggle, and a wide one scrolls in its own box at 375px
- Visual layout, typography and dark mode are checked by the Owner on preview URLs, not by automated tests. Promo images are checked by reading the PNGs `pnpm promo` writes.
- There's no prior art yet: this is a greenfield repo, and these suites set the pattern.

## Out of Scope

- Demos and everything behind them (model provider, server-side model calls, abuse protection). This is phase 2 and will be re-grilled.
- Scheduled publishing.
- An "unpublished" or archived state: Takedown is the only removal.
- Languages other than Traditional Chinese.
- Comments.
- Categories and Series.
- Newsletter and memberships.
- A web UI for writing content.
- Choosing and configuring a custom domain.
- Search.

## Further Notes

- Domain terms follow `GLOSSARY.md`: Owner, Writing Agent, Post, Page, Demo, Slug, Tag, Draft, Published, Review, Correction, Revision, Takedown.
- Two tasks need the Owner by hand: creating the GitHub repo, and connecting it to Vercel (including Analytics).
- The About page content and the write-post voice section are blocked on the Owner's 2–3 sample texts.
