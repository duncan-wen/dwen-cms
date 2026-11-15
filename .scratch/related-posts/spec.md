# Spec: Related Posts and the Analytics opt-out

**Status:** ready-for-agent

## Problem Statement

A Reader who finishes a Post has nowhere obvious to go next. A Post in a Series ends with 「上一篇」 and 「下一篇」, but the other Posts (6 of the 11 Published today) end with only 「所有文章」 and 「聯絡我」. Web Analytics for 2026-10-31 to 2026-11-15 shows that Readers mostly arrive from a Threads or LinkedIn link straight onto one Post, about half of them on a phone, and few go on to a second page.

The same numbers can't say how few, because most of the pageviews are the Owner's own. Vercel counts a visitor per device per day, so the Owner checking the site on a computer and a phone reads as some 30 visitors over those 16 days. Until the Owner's visits are left out, no change to the site can be judged by its numbers.

## Solution

1. **Analytics opt-out**: a page only the Owner uses, `/owner/analytics`, titled 「統計設定」. It says whether this device's visits are counted and has one button to switch. A device that has opted out sends nothing to Web Analytics. The Owner opens it once on each device.
2. **Related Posts**: every Post ends with 「接著讀」, up to 3 other Posts picked automatically, each shown with its Cover, title and description.

The opt-out ships first, so that clean numbers start as early as possible.

## User Stories

1. As the Owner, I want my own visits left out of Web Analytics, so that the numbers describe Readers.
2. As the Owner, I want the page to say whether this device is counted, so that I can tell when clearing my browser has undone the opt-out.
3. As the Owner, I want to switch it back on with the same button, so that I can check that counting still works.
4. As the Owner, I want the page kept out of search results, the sitemap and every navigation, so that Readers don't meet it.
5. As a Reader, I want my visits counted exactly as before, so that nothing changes for me.
6. As a Reader who finishes a Post, I want to see up to 3 other Posts to read next, so that I don't have to go back to a listing.
7. As a Reader, I want the Posts closest in subject offered first, so that the next one is likely to interest me.
8. As a Reader, I want each one shown with its Cover, title and description, so that I can tell whether to open it.
9. As a Reader on a phone, I want the Covers kept and the list to fit my screen, so that it reads as well as on a computer.
10. As a Reader of a Post in a Series, I want 「接著讀」 to offer Posts outside the Series, so that it doesn't repeat 「上一篇」 and 「下一篇」.
11. As a Reader, I want a Post from a Series marked 「系列：<title>」, so that I know it's part of something longer.
12. As a Reader, I want 「接著讀」 after the Signature, so that the Post finishes before I'm pointed elsewhere.
13. As a Writing Agent, I want Related Posts picked with no frontmatter, so that publishing a Post never means editing older ones.
14. As the Owner, I want the same Posts picked on every build, so that a page doesn't change without a content change.

## Implementation Decisions

- **Analytics opt-out**: a flag in the browser's `localStorage`. The site's `<Analytics />` gets a `beforeSend` that drops every event while the flag is set. Storage that can't be read counts as not opted out. The flag's key and the read live in one module, shared by `beforeSend` and the page.
- **The page**: `/owner/analytics`, a client component, `robots: { index: false }`, absent from `sitemap.ts`, the header, the footer and every link on the site. It shows 「這台裝置的瀏覽會計入統計」 or 「這台裝置的瀏覽不會計入統計」 and one button that switches between them. It isn't secret: a stranger who finds it can only leave their own visits out.
- **Picking Related Posts**: a new query on the content module, `listRelatedPosts(slug)`, returning up to 3 Published Posts. Candidates are every Published Post except the Post itself and the Posts of its own Series. They are ordered by the number of Tags shared with the Post (most first), then by date (newest first), then by Slug (A to Z). The first 3 are returned, so when fewer than 3 share a Tag the newest others fill the remaining places. A Post in a Series not yet shown (fewer than 2 Published) still leaves out its Series' Posts.
- **Showing them**: a `RelatedPosts` component on the Post page, after the Signature and before the 「所有文章／聯絡我」 row. Its heading is 「接著讀」. Each Post is one row, stacked: a small Cover on the left (through `PostCover`, kept on phones), then the title linking to the Post, the description clamped to 2 lines, and `SeriesLabel` when the Post is in a shown Series. No date and no Tags. With no candidates the block isn't rendered. `PostRow` isn't reused: it leads with a marker column and hides its Cover on phones. `RelatedPosts` joins the "one way to do each thing" list in `CODING_STANDARDS.md`.
- **Filled places aren't marked**: a Post that shares no Tag appears under the same heading as one that does.
- **Names**: `GLOSSARY.md` gains **Related Posts** (shown to readers as 「接著讀」; unlike a Series, unordered and picked automatically) and **Analytics opt-out**.

## Testing Decisions

- **`listRelatedPosts` (vitest, a fixture content directory)**: more shared Tags come first; equal shared Tags fall back to the newer date, then the Slug, with fixture data that loads in another order; the Post itself, its Series' Posts, Drafts and taken-down Slugs never appear; fewer than 3 sharing a Tag are filled with the newest others; a site with one Post returns none.
- **Analytics opt-out (vitest)**: the module's `beforeSend` returns the event when the flag is unset and `null` when it's set, and returns the event when storage throws.
- **Smoke (Playwright, `e2e/content`)**: a Post shows 「接著讀」 after the Signature with at most 3 links to other Posts, none to itself; `/owner/analytics` answers with `noindex`, isn't in `/sitemap.xml`, and its button switches the stated status and survives a reload.
- **Visual**: `pnpm shots` of a Post in light and dark at 1280px and 375px for the Owner's review; `/owner/analytics` is shot too, for the agent to read.
- **Only a person can check**: that an opted-out device's visits stop appearing in Web Analytics. On the PR's Vercel preview the agent watches the browser's own request to Web Analytics: a browser that has opted out sends none, one that hasn't sends one. The Owner opts out their own devices once it's on production.

## Out of Scope

- Counting clicks on Related Posts: custom events need a paid Vercel plan.
- Measuring time on page or scroll depth.
- The Owner choosing a Post's Related Posts by hand.
- Curating the home page or the About page.
- Site search.
- Leaving out visits by IP address or by login.

## Further Notes

- Two tickets on one integration branch, `related-posts`, but each reaches `main` in its own PR: the opt-out first, then Related Posts once the Owner says OK to the screenshots. The opt-out doesn't wait for that review.
- Judging the result: 2 to 3 weeks after the opt-out ships, compare pageviews per visitor, and whether visitors from Threads and LinkedIn reach a second page, against the same numbers after Related Posts ships. At this traffic the comparison is rough.
- The Hobby plan keeps 31 days of Web Analytics, so the "before" numbers have to be read before they age out.
