# 04: Feedback at the end of every Post

**What to build:** At the end of every Post's body, before its closing footer, a Reader sees 「這篇對你有幫助嗎？」 with 👍 and 👎. One click sends Feedback straight away and then offers an optional one-line box (up to 200 characters) with a send button; filling it in sends a second piece of Feedback for the same Post and vote. Coming back to that Post later shows a thank-you instead of the buttons. Pages show no Feedback block, and no counts appear anywhere. Behind it, the Owner inbox's *send Feedback* takes the Slug, the vote and the optional line, resolves the Slug to the Post's title and absolute URL through the content module's queries, and emails the Owner; recording a piece of Feedback is a single function inside the Owner inbox, so storage can be added later without touching the page. See `../spec.md`.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] The Owner inbox exposes *send Feedback* (Slug, 👍/👎, optional line), returning success or a named failure; an unknown Slug is `invalid`
- [ ] The email names the Post's title, links to its absolute URL and says 👍 or 👎, plus the line when given
- [ ] The line is trimmed and limited to 1–200 characters when present, from the same shared limits as the Contact form
- [ ] Recording a piece of Feedback is one function inside the Owner inbox
- [ ] Every Post shows the block before its closing footer; no Page does; no Post needs frontmatter to opt in
- [ ] The browser remembers, per Slug, that Feedback was given and shows a thank-you on return; unavailable storage just shows the buttons again
- [ ] If 03 has landed on the integration branch, Feedback submissions are covered by BotID too
- [ ] vitest covers *send Feedback* through the Owner inbox's exports with a fake transport
- [ ] Smoke covers: a Post shows the block and a Page doesn't; clicking 👍 shows the optional line; reloading the Post shows the thank-you
- [ ] `pnpm shots /posts/typography-sample` in light and dark at 1280px and 375px, read before ticking; the Owner says OK to the screenshots
- [ ] Once 02 has landed, the agent sends one piece of Feedback on the PR's Vercel preview and the Owner confirms the 【預覽】 email arrived
