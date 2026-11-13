# 01: A Demo plays inside a Post, end to end

**What to build:** The first Demo, `listener-player`, served from `public/demos/listener-player/` and embedded in a Post with `<Demo slug title />`, as `../spec.md` describes: the framed iframe headed 「互動展示：<title>」, the 「全螢幕開啟」 link, the standalone page's back link and `noindex`, and the content check rules. Source of the Demo: parents-story, branch `prototype/player`, `prototypes/player/` (its `audio/` and `story.js` are built by `serve.py` from the private voice audition folder).

**Blocked by:** None (can start immediately)

**Status:** done

- [x] `GLOSSARY.md`'s **Demo** says it is shown to readers as 「互動展示」 and lives in `public/demos/<slug>/`
- [x] `public/demos/listener-player/` holds the prototype with its debug readouts removed, the variant switcher kept, a prototype label, `noindex` and 「← 回到文章」
- [x] `isDemo` in `src/mdx/md-tree.ts` serves the check; rules `demo-needs-files`, `demo-needs-title`, `demo-own-line`, each with its own fixture and an error naming file, field and rule
- [x] `<Demo />` is in the MDX component map and draws the frame, the lazy iframe (3:4 on a phone, 16:10 above `sm`) and 「全螢幕開啟」
- [x] `CODING_STANDARDS.md` lists `<Demo />` among the shared pieces
- [x] Smoke: an `e2e/content` Post embeds the Demo; the iframe, heading and link show; the Demo page answers 200 with `noindex` and the back link; its MP3s answer 200 as `audio/mpeg`
- [x] `pnpm shots` of that Post in light and dark at 1280px and 375px, read before ticking; nothing scrolls sideways
- [x] The Owner has seen the screenshots and said OK

## Comments

- 2026-11-14: Owner reviewed the screenshots and said OK.
