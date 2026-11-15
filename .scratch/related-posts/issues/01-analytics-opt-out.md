# 01: Analytics opt-out

**What to build:** The Owner opens `/owner/analytics` (「統計設定」) on a device, sees whether its visits are counted, and presses one button to switch. While a device is opted out, the site sends nothing to Web Analytics from it; every other visitor is counted as before. The page stays out of search results, the sitemap and all navigation. See `../spec.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] One module holds the opt-out flag's `localStorage` key, the read, the write and the `beforeSend` that drops an event while the flag is set; unreadable storage counts as not opted out
- [x] The layout's `<Analytics />` uses that `beforeSend`
- [x] `/owner/analytics` shows 「這台裝置的瀏覽會計入統計」 or 「這台裝置的瀏覽不會計入統計」 and one button that switches between them; the choice survives a reload
- [x] The page is `noindex`, absent from `/sitemap.xml`, and linked from nowhere on the site
- [x] `GLOSSARY.md` gains **Analytics opt-out**
- [x] vitest covers `beforeSend`: flag unset returns the event, flag set returns `null`, storage that throws returns the event
- [x] Smoke covers: `noindex`, not in the sitemap, the button switching the status and surviving a reload
- [x] `pnpm shots /owner/analytics` read in light and dark at 1280px and 375px
- [ ] On the PR's Vercel preview, a browser that has opted out sends no pageview to Web Analytics and one that hasn't sends one (named in the PR)

## Comments

- 2026-11-15: The last box first read "on production, checked through the analytics API". It now reads "on the PR's preview", watching the browser's own request to Web Analytics: that can be checked before merging, and the request is the thing the opt-out stops.
