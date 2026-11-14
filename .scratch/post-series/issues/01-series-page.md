# 01: A Series has its own page, end to end

**What to build:** `content/series.yml`, the optional `series` front matter, the content check rules and the content module's Series, as `../spec.md` describes, shown to Readers through the Series page `/series/<id>` and its sitemap entry. The `concurrency` Series goes live with the Python and Go Posts.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] `content/series.yml` holds `concurrency` (「並行，一次搞懂」, 「同一台 8 核心電腦，實測不同語言怎麼處理並行」); `python-concurrency-models` and `go-goroutines-explained` carry `series: concurrency`
- [x] Content check rules `series-unknown`, `series-not-string`, `series-same-date`, `series-file`, each with its own fixture and an error naming file, field and rule
- [x] The content module gives a Post's Series and neighbours from Published Posts only, oldest first; a Series under 2 Published Posts counts as absent (unit tests, including a Draft and a taken-down Post not counted)
- [x] `/series/[id]` lists the title, description and Posts in order, with its own title, description and the default OG image; any other id answers 404; `sitemap.ts` lists it
- [x] Smoke: `e2e/content` has a `series.yml` and a Series of 2 smoke Posts; the Series page answers 200 and lists both in order; an unknown id answers 404; the sitemap lists the page
- [x] `pnpm shots` of the Series page in light and dark at 1280px and 375px, read before ticking; nothing scrolls sideways
- [ ] The Owner has seen the screenshots and said OK
