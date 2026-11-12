# Spec: Search and AI visibility (SEO, AEO, GEO)

**Status:** ready-for-agent

## Problem Statement

The Owner wants Readers to find the site two ways: first, someone searching a technical question finds a Post and an AI answer cites it with a link; second, someone searching the Owner's name finds the site and the About Page. Today the site has a sitemap, canonical URLs, Open Graph images and an RSS feed, but `/robots.txt` answers 404 (so the sitemap is advertised nowhere) and no page carries structured data, so search engines get no machine-readable account of who wrote a Post, when, or who the Owner is.

Research against primary sources (`research.md`, next to this spec) settled what "AEO" and "GEO" mean for this site: Google says AI Overviews and AI Mode need nothing beyond ordinary SEO, no vendor has committed to reading `llms.txt`, and every AI vendor separates its training crawler from its search crawler. So this spec is ordinary SEO done properly, plus an explicit crawler policy.

## Solution

- `/robots.txt` allows every crawler, AI training crawlers included, and names the sitemap.
- Each Post page carries `BlogPosting` structured data, and the signature at the end of each Post links to the About Page.
- The About Page carries `ProfilePage` structured data whose main entity is the Owner as a `Person`, and the home page carries `WebSite` structured data naming the site.

Google Search Console verification already shipped (PR #89): the Owner verified a URL-prefix property through the `google-site-verification` meta tag, because the subdomain is a CNAME and can't also hold a TXT record. Bing Webmaster Tools is imported from Search Console by the Owner.

## User Stories

1. As a Reader searching a technical question, I want Google to show the Post with its author and date, so that I can judge whether it's worth opening.
2. As a Reader asking an AI assistant a question, I want the assistant to be able to fetch and cite the Post, so that I can follow the link to the source.
3. As a Reader who finished a Post, I want to click the Owner's name in the signature, so that I can learn who wrote it.
4. As someone searching "Duncan Wen", I want the site and its About Page in the results, linked to the Owner's GitHub and LinkedIn, so that I know they're the same person.
5. As someone seeing the site in search results, I want it named "Duncan Wen" rather than shown as a bare domain, so that I recognise it.
6. As a search engine crawler, I want `/robots.txt` to point at the sitemap, so that I find every Published Post.
7. As an AI training or search crawler, I want an explicit allow, so that the Owner's choice is stated rather than implied by a 404.
8. As the Owner, I want structured data built from the same Post fields the page already shows, so that a Revision updates the modified date everywhere at once.
9. As the Owner, I want Search Console to report no structured-data errors a week after launch, so that I know it worked.

## Implementation Decisions

- **Crawler policy**: one rule allowing every user agent. No per-bot groups: AI training crawlers (`GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`, `CCBot`) are allowed by the Owner's choice, and search/citation crawlers must stay allowed. The file also names the sitemap's absolute URL on the configured base URL.
- **Structured data** is JSON-LD in a `<script type="application/ld+json">` rendered by the page, with `<` escaped. One small module builds the three objects from domain values, so no page assembles schema.org shapes by hand.
- **`BlogPosting`** (each Published Post): `headline` (title), `description`, `datePublished` (the Post's date), `dateModified` (latest Revision's date, else the Post's date: the same rule the sitemap uses), `author` as a `Person` named "Duncan Wen" with `url` the About Page, `image` the Post's existing Open Graph image, `inLanguage` `zh-Hant`, `keywords` from its Tags, `url`/`mainEntityOfPage` its canonical URL. Taken-down Posts get none.
- **Dates are date-only** (`YYYY-MM-DD`). Posts record no time, so adding a time and zone would invent one.
- **Image**: the existing 1200×630 Open Graph image only; no extra 16:9/4:3/1:1 renders.
- **`ProfilePage`** (About Page): `mainEntity` is a `Person` named "Duncan Wen", `url` the About Page, `sameAs` exactly the GitHub and LinkedIn URLs the site already lists in its contact links (read from that one source). No `image`: the Owner has no photo on the site, and the seal is a logo, not a profile image.
- **`WebSite`** (home page): `name` the site name ("Duncan Wen", the existing site-name constant), `url` the home page. No `alternateName`, no `SearchAction` (sitelinks search box is retired).
- **Signature link**: the Owner's name in the existing signature at the end of each Post becomes a link to the About Page. The Post's opening is unchanged and no new byline is added. Style stays as it is apart from what a link needs.
- **Site name stays "Duncan Wen"**. Renaming the site was discussed and dropped.

## Testing Decisions

- One seam: the smoke suite against the built `e2e/content` site, which already checks the sitemap, canonical URLs and the feed this way. Tests read what a crawler receives, not how it's built.
- `/robots.txt` answers 200 as text, allows all user agents, and names the sitemap on the base URL.
- A Post page's JSON-LD parses, is a `BlogPosting` with date-only dates, `dateModified` equal to the latest Revision's date for a Post with Revisions, and an author linking to the About Page. A taken-down Slug has none.
- The About Page's JSON-LD is a `ProfilePage` whose `sameAs` is exactly the GitHub and LinkedIn URLs. The home page's is a `WebSite` named "Duncan Wen".
- The signature's name links to the About Page.
- The signature change is visual: `pnpm shots` on a Post page, read before ticking, and the Owner says OK.

## Out of Scope

- `llms.txt` and per-Post Markdown copies: no vendor reads them and Google ignores them.
- Extra Open Graph image ratios.
- Disclosing AI-assisted writing: a content decision, not SEO.
- Renaming the site.
- FAQ and HowTo structured data (retired), `hreflang` (one language).
- A "most read" Posts section built from Vercel Web Analytics: a separate feature, to start with its own `/grilling`.

## Further Notes

- `research.md` holds the cited primary sources behind every decision here.
