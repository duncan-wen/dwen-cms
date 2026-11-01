# 15: Promo images from brand templates

**What to build:** A command that turns a Post into ready-to-post promo images (文宣圖) for social media, using templates in the site's colours and fonts. A Writing Agent runs `pnpm promo <slug>` and gets PNGs to attach to the Draft PR; the Owner can also open them from a one-page contact sheet. No AI image model and no API key.

**Blocked by:** 07

**Status:** done

- [x] `pnpm promo <slug>` writes PNGs at the main social sizes: 1200×630 (Facebook / LinkedIn / X), 1080×1080 (square) and 1080×1350 (Instagram portrait)
- [x] Each image shows the Post's title, and a short list of key points from optional `promo` frontmatter (falling back to the description)
- [x] Three templates, from the prototype: **contour** (A, the default: the Post's generated contour cover beside or above the title on a paper panel), **flow** (C: numbered steps as the hero, horizontal at 1200×630 and stacked in the square and portrait sizes, last step filled) and **terminal** (D: dark tokens, title over a terminal-style box of commands with comments)
- [x] `promo.template` in frontmatter picks the template; flow takes its steps (name plus an optional command) and terminal its lines from `promo` frontmatter, and the content check rejects a flow or terminal template without them
- [x] Titles break where the Writing Agent says (e.g. after the full-width comma) instead of mid-word
- [x] Traditional Chinese renders correctly, and long titles wrap without overflowing
- [x] The images do **not** carry the 「溫」 seal
- [x] It writes a contact sheet HTML next to the PNGs, and the output folder is gitignored
- [x] A new `promo` frontmatter field is validated by the content module and documented in GLOSSARY or the write-post skill

## Comments

- 2026-11-01: the Owner chose brand templates over an AI image model, and asked that the promo images leave out 「溫」 (the seal stays on the site, favicon and OG images).
- Reuse the shared pieces from 08 where they fit (`serifFont`, `lightColours`, the OG rendering). Rendering with Playwright is fine because this runs on a workstation or in CI, not in the Vercel build.
- 2026-11-01: the Owner picked templates from the prototype (branch `prototype/promo-images`, `.scratch/blog-v1/prototype/promo/render.ts`; contact sheet from `pnpm tsx` on that file). Use A (contour) for most Posts, C (flow) when a Post mainly introduces a process, and D (terminal) when it's mainly about coding. B (vertical title) was not picked. The write-post skill (12) tells the Writing Agent how to choose.
- The flow template draws its own steps rather than embedding a Mermaid diagram, so 15 no longer waits on 14.
- 2026-11-01: built. `pnpm promo <slug>…` (with `CONTENT_DIR` for another content directory) writes `promo/<slug>-<size>.png` and `promo/index.html`, the contact sheet for that run; `/promo/` is gitignored. Colours come from the tokens through `lightColours`, and `darkColours` (new, same file) gives terminal the dark tokens; titles and step names use `serifFont`, points and comments the site's sans stack (Noto Sans TC on Linux), commands and dates JetBrains Mono. `promo.titleLines` must split the title without changing its words (whitespace aside). Text that would overflow shrinks, the title first, so long titles and long commands stay inside the image. The e2e Posts `smoke-post` (contour), `typography-sample` (flow) and `revised-smoke-post` (terminal) carry `promo` frontmatter; long titles were checked with a throwaway content directory. Contact sheet: `CONTENT_DIR=e2e/content pnpm promo smoke-post typography-sample revised-smoke-post`, then `explorer.exe promo/index.html`.
