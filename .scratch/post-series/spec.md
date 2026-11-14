# Spec: Post series

**Status:** done

## Problem Statement

Some of the Owner's Posts belong together and are meant to be read in order. The Python concurrency Post (`python-concurrency-models`) and the Go concurrency Post (`go-goroutines-explained`) are two runs of the same experiment on the same 8-core machine, and the Go Post opens by pointing back at the Python one with a hand-written link. Nothing on the site says the two belong together. A Reader who lands on one can't see that the other exists, which one comes first, or whether more are coming. Tags don't help: they have no order, and a Post carries several.

The blog-v1 spec left Series out of scope. This spec brings it in (ADR 0006).

## Solution

A **Series** (「系列」) is an ordered group of Posts, read first to last like a small course. Each Series has an id, a title and a one-line description in an approved list, `content/series.yml`. A Post joins one by naming its id in front matter (`series: concurrency`), and belongs to at most one. Its place in the Series follows its date. A Post's URL stays `/posts/<slug>` whether or not it belongs to a Series.

A Series appears on the site only once at least 2 of its Posts are Published. Then:

- **The Series page** `/series/<id>` shows the title, the description and the Series' Published Posts in order.
- **On each of its Posts**, a contents box near the opening lists every Post in the Series, marks the one being read and links to the Series page. At the end, before the Signature, 「上一篇」 and 「下一篇」 link to the Posts around it (just one of them on the first or last Post).
- **On Post cards** (the home page and `/posts`), a small 「系列：<title>」 label links to the Series page.

There is no `/series` index page and no nav entry; they wait until there are more Series. Nothing announces Posts that aren't Published yet.

The first Series is `concurrency`, 「並行，一次搞懂」, described as 「同一台 8 核心電腦，實測不同語言怎麼處理並行」, holding the Python and Go Posts.

The Owner agreed these decisions in chat on 2026-11-14 (grilling, three rounds, Q1–Q14).

## User Stories

1. As a Reader of a Post in a Series, I want to see near the top every Post in the Series and which one I'm reading, so that I know where I am in it.
2. As a Reader finishing a Post in a Series, I want a link to the next Post (or the previous one, at the end of the Series), so that I can keep reading in order.
3. As a Reader, I want a Series page with its title, description and Posts in order, so that I can start from the first Post.
4. As a Reader browsing the home page or `/posts`, I want to see which Posts belong to a Series, so that I can find the Series.
5. As a Reader, I don't want a Series shown while it has only one Post, or Posts promised that don't exist yet, so that the site never shows an empty course.
6. As a Reader arriving from search, I want a Post's URL to stay the same when it joins or leaves a Series, so that links and bookmarks keep working.
7. As the Owner, I want the content check to fail a Post naming a Series not in `content/series.yml`, so that a typo never ships a Series of one.
8. As the Owner, I want the Writing Agent to suggest a Series for a Draft whose Topic fits one, and leave the choice to my Review, so that Series grow without my remembering to add them.
9. As the Owner, I want search engines and AI summaries to read which Series a Post belongs to, so that the Posts are understood as a set.

## Implementation Decisions

- **Glossary**: a new **Series** entry (shown to readers as 「系列」), next to **Tag**, saying how the two differ.
- **ADR 0006** records why Series is in after blog-v1 left it out, and why it is ordered by date and kept apart from Tags and URLs.
- **`content/series.yml`**: a map from id (lowercase English kebab-case) to `{ title, description }`, both non-empty strings. A Series listed but not yet used is fine, as with Tags.
- **Front matter**: optional `series: <id>`, a single string.
- **Content check**, each rule with its own fixture and an error naming file, field and rule:
  - `series-unknown`: `series` names an id not in `content/series.yml`;
  - `series-not-string`: `series` is anything but one string (a list, a number, empty);
  - `series-same-date`: two Posts in the same Series share a date, so their order is undefined;
  - `series-file`: `content/series.yml` is malformed, an id isn't kebab-case, or an entry lacks a title or description.
- **Content module**: the Series of a Post and its place are derived from Published Posts only, oldest first. A Series with fewer than 2 Published Posts counts as absent everywhere: no page, no box, no label, no sitemap entry. Taking a Post down, or dropping its `series`, removes it from the Series and renumbers the rest; the module needs no record of that.
- **Series page** `/series/[id]`: statically generated for each Series that is shown; any other id answers 404 (a Series is derived, never Published, so it doesn't answer 410 the way a Takedown does). Its own `<title>` and description from `series.yml`, the site's default OG image, and an entry in `sitemap.ts`.
- **Post page**: the contents box sits in the Post's opening, after the date and Tags; 「上一篇」／「下一篇」 sit after the body and before the Signature. The Post's JSON-LD (`src/structured-data.ts`) gains `isPartOf`, naming the Series page.
- **Post cards**: `post-list.tsx` and `post-grid.tsx` show the 「系列：<title>」 label for Posts in a shown Series.
- **Look**: built from the existing pieces (Tag list, post list, table of contents) and reviewed through `pnpm shots`, no prototype.
- **First Series**: `concurrency` goes into `content/series.yml`; `python-concurrency-models` and `go-goroutines-explained` gain `series: concurrency`. The Go Post's opening sentence pointing back at the Python one stays: it is part of the prose.
- **Writing Agent**: `.claude/skills/write-post` checks `content/series.yml` while drafting. When the Topic fits a Series, the Draft adds `series` and the PR body says so, for the Owner to keep or drop in Review. A new Series is added to `series.yml` in the same PR as its first Post.

## Testing Decisions

- Content module unit tests through `loadContent`, with fixtures: a Post's Series and neighbours; order by date; a Series with 1 Published Post counts as absent; a Draft or taken-down Post isn't counted; each check rule above.
- Smoke (built site): `e2e/content` gains a `series.yml` and a Series of 2 smoke Posts. `/series/<id>` answers 200 and lists both in order; each Post shows the contents box with itself marked and the right 「上一篇」 or 「下一篇」; the home page and `/posts` show the label; an unknown `/series/<id>` answers 404; the sitemap lists the Series page.
- `pnpm shots` of the Series page and both Posts in light and dark at 1280px and 375px: nothing scrolls sideways or clips.

## Out of Scope

- A `/series` index page and a nav entry.
- Explicit part numbers (`part: 2`) in front matter; add them if a Post ever needs to come before an older one.
- 「即將推出」 placeholders, or a Series status such as 「完結」.
- A Series' own RSS feed or OG image.
- A Post in more than one Series.
- Reader comments, which wait for this to ship (`.scratch/reader-comments/notes.md`).

## Comments

**Retro notes from ticket 01 (2026-11-14), for the retro after the last ticket:**

- The spec asked for "the site's default OG image" on the Series page, but the site has none: only Posts draw an OG image. The Series page sets none, as Tag pages do. Lesson for grilling: check a fact like this against the code before writing it into a spec.
- Code review found the Series page's rows copied the Post list's row. They now share `PostRow`, which is listed in `CODING_STANDARDS.md`. The reviewer caught it, so no new rule is needed.
