# Spec: Demos embedded in a Post

**Status:** ready-for-agent

## Problem Statement

The Owner's Post on the parents-story app (`voice-clone-bedtime-story`, draft PR #103) describes a Listener player prototype: three ways for a child to hear a picture book read in a parent's cloned voice, with each character lit up as it is spoken. Words and screenshots can't show what the prototype is about: hearing the voice and watching the text follow it. The Owner wants Readers to play the prototype inside the Post. The glossary already names this a **Demo** ("an interactive AI showcase that stands on its own and can also be embedded in a Post"), but the site has no way to host or embed one.

## Solution

A **Demo** (「互動展示」) is a self-contained static web page (HTML, scripts, audio) stored under `public/demos/<slug>/` and served as-is at `/demos/<slug>/index.html`. A Post's body embeds it with `<Demo slug="<slug>" title="<name>" />`, which draws, in the reading column:

- a framed iframe of the Demo, landscape (16:10) on wide screens and portrait on a phone, headed 「互動展示：<title>」;
- a 「全螢幕開啟」 link under it to the Demo's own URL, for Demos that need the whole screen.

The Demo opened on its own has a small 「← 回到文章」 link back to its Post, and `noindex`, so search engines send Readers to the Post rather than the bare Demo. There is no `/demos` listing yet: it waits for a second Demo.

The first Demo is `listener-player`, copied from the parents-story repo's `prototype/player` branch (`prototypes/player/`) and owned by this site from then on:

- the debug readouts (wake-lock status, LAN hints) are removed;
- the A／B／C variant switcher stays, since the Post describes all three;
- the emoji placeholder illustrations stay, and the page says it is a prototype;
- its three narration MP3s (the Owner's ElevenLabs-cloned voice, about 600 KB) and per-character timestamps are published with it: the Owner agreed to publish the cloned voice.

The Owner agreed these decisions in chat on 2026-11-14 (grilling, Q1–Q8).

## User Stories

1. As a Reader, I want to play a Demo inside the Post that describes it, so that I hear and see what the Post is talking about without leaving it.
2. As a Reader, I want the Demo framed and labelled 「互動展示」, so that I know this box is something I can play, not a picture.
3. As a Reader on a phone, I want the embed to fit my screen's column and to open the Demo full screen with one link, so that a Demo built for a tablet is still usable.
4. As a Reader who opened a Demo on its own, I want a link back to its Post, so that I can read the context.
5. As a Reader in the dark theme, I want the Demo not to glare, so that it sits comfortably in the page.
6. As the Owner, I want the content check to fail a `<Demo>` whose slug has no Demo or whose title is missing, so that a broken embed never ships.
7. As the Owner, I want the bare Demo pages kept out of search results, so that search traffic lands on my Posts.

## Implementation Decisions

- **Glossary**: the **Demo** entry gains "Shown to readers as 「互動展示」" and says where a Demo lives (`public/demos/<slug>/`, served as-is).
- **Storage and URL**: `public/demos/<slug>/index.html` plus whatever it loads, by relative paths. The URL ends in `index.html` (`/demos/<slug>/index.html`), so its relative paths resolve without a rewrite; Next.js doesn't serve a folder's `index.html` on its own.
- **`<Demo slug title />`** joins the component map in `src/mdx/components.tsx`. Its iframe is lazy-loaded, carries `title` for screen readers, and fills the reading column; its aspect ratio is portrait (3:4) below the `sm` breakpoint and 16:10 above. The frame uses the site's border and radius tokens. The Demo keeps its own colours in both themes; a Demo whose page is light must dim itself for `prefers-color-scheme: dark` (the first Demo is dark brown, so nothing to dim).
- **Content check**: a shared predicate (`isDemo` in `src/mdx/md-tree.ts`) finds `<Demo>` elements. Rules, each with its own fixture:
  - `demo-needs-files`: the `slug` has no `public/demos/<slug>/index.html`;
  - `demo-needs-title`: `title` is missing or empty;
  - `demo-own-line`: `<Demo>` inside a line of text.
- **Standalone page**: the Demo's own HTML carries `<meta name="robots" content="noindex">` and the 「← 回到文章」 link to its Post. The sitemap already lists only Posts, Pages and Tags, so it needs no change.
- **The first Demo**: `public/demos/listener-player/` holds `index.html`, `story.js` and `audio/page-{1,2,3}.mp3`, copied from parents-story; the back link points at `/posts/voice-clone-bedtime-story`.
- **Shipping**: this feature's PR merges first; the Post's PR #103 then adds `<Demo slug="listener-player" title="小熊阿布播放器原型" />` after the paragraph that introduces the three variants.

## Testing Decisions

- Content-check unit tests, one fixture per rule above, through the content module's errors.
- Smoke (built site): a Post in `e2e/content` embedding `listener-player` shows an iframe titled with the Demo's title, under 「互動展示：…」, and a 「全螢幕開啟」 link; `/demos/listener-player/index.html` answers 200 and has the `noindex` meta and the back link; its MP3s answer 200 with `audio/mpeg`.
- `pnpm shots` of the smoke Post in light and dark at 1280px and 375px: nothing scrolls sideways or clips.

## Out of Scope

- A `/demos` listing page, Demo pages in the sitemap, Demo metadata files.
- Demos that call an AI model live.
- Redesigning the prototype (real illustrations, a chosen variant).
