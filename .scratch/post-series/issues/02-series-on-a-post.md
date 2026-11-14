# 02: A Post shows its Series

**What to build:** On a Post in a shown Series, the contents box in the opening and 「上一篇」／「下一篇」 before the Signature, plus `isPartOf` in the Post's JSON-LD, as `../spec.md` describes.

**Blocked by:** 01

**Status:** ready-for-agent

- [x] The contents box sits after the date and Tags, lists every Post in the Series, marks the one being read and links to the Series page
- [x] 「上一篇」 and 「下一篇」 sit after the body and before the Signature; the first Post shows only 「下一篇」, the last only 「上一篇」
- [x] A Post outside a Series, or in one with fewer than 2 Published Posts, shows neither
- [x] `src/structured-data.ts` adds `isPartOf` naming the Series page
- [x] Smoke: each Series smoke Post shows the box with itself marked and the right neighbour link; its JSON-LD has `isPartOf`
- [x] `pnpm shots` of both Series smoke Posts in light and dark at 1280px and 375px, read before ticking; nothing scrolls sideways
- [x] The Owner has seen the screenshots and said OK
