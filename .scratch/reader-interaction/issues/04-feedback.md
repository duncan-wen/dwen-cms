# 04: Feedback at the end of every Post

**What to build:** At the end of every Post's body, before its closing footer, a Reader sees 「這篇對你有幫助嗎？」 with 👍 and 👎. One click sends Feedback straight away and then offers an optional one-line box (up to 200 characters) with a send button; filling it in sends a second piece of Feedback for the same Post and vote. Coming back to that Post later shows a thank-you instead of the buttons. Pages show no Feedback block, and no counts appear anywhere. Behind it, the Owner inbox's *send Feedback* takes the Slug, the vote and the optional line, resolves the Slug to the Post's title and absolute URL through the content module's queries, and emails the Owner; recording a piece of Feedback is a single function inside the Owner inbox, so storage can be added later without touching the page. See `../spec.md`.

**Blocked by:** 01

**Status:** done

- [x] The Owner inbox exposes *send Feedback* (Slug, 👍/👎, optional line), returning success or a named failure; an unknown Slug is `invalid`
- [x] The email names the Post's title, links to its absolute URL and says 👍 or 👎, plus the line when given
- [x] The line is trimmed and limited to 1–200 characters when present, from the same shared limits as the Contact form
- [x] Recording a piece of Feedback is one function inside the Owner inbox
- [x] Every Post shows the block before its closing footer; no Page does; no Post needs frontmatter to opt in
- [x] The browser remembers, per Slug, that Feedback was given and shows a thank-you on return; unavailable storage just shows the buttons again
- [x] If 03 has landed on the integration branch, Feedback submissions are covered by BotID too
- [x] vitest covers *send Feedback* through the Owner inbox's exports with a fake transport
- [x] Smoke covers: a Post shows the block and a Page doesn't; clicking 👍 shows the optional line; reloading the Post shows the thank-you
- [x] `pnpm shots /posts/typography-sample` in light and dark at 1280px and 375px, read before ticking; the Owner says OK to the screenshots
- [x] Once 02 has landed, the agent sends one piece of Feedback on the PR's Vercel preview and the Owner confirms the 【預覽】 email arrived

## Comments

- 2026-11-10: Content isn't read at request time, so next.config.ts writes each Published Post's title into the build as `POST_TITLES`, keyed by Slug, the way it passes the taken-down Slugs; the Owner inbox resolves a Slug through it, never from the request.
- 2026-11-10: The Owner said OK to the `/about` and `/posts/typography-sample` screenshots, and from their own browser on the PR #63 preview sent a vote, its line and a Contact form message; all three 【預覽】 emails arrived, so BotID lets a real Reader through (a headless browser was blocked).
