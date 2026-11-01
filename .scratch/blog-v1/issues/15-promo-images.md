# 15: Promo images from brand templates

**What to build:** A command that turns a Post into ready-to-post promo images (文宣圖) for social media, using templates in the site's colours and fonts. A Writing Agent runs `pnpm promo <slug>` and gets PNGs to attach to the Draft PR; the Owner can also open them from a one-page contact sheet. No AI image model and no API key.

**Blocked by:** 07

**Status:** ready-for-agent

- [ ] `pnpm promo <slug>` writes PNGs at the main social sizes: 1200×630 (Facebook / LinkedIn / X), 1080×1080 (square) and 1080×1350 (Instagram portrait)
- [ ] Each image shows the Post's title, and a short list of key points from optional `promo` frontmatter (falling back to the description)
- [ ] Three templates, from the prototype: **contour** (A, the default: the Post's generated contour cover beside or above the title on a paper panel), **flow** (C: numbered steps as the hero, horizontal at 1200×630 and stacked in the square and portrait sizes, last step filled) and **terminal** (D: dark tokens, title over a terminal-style box of commands with comments)
- [ ] `promo.template` in frontmatter picks the template; flow takes its steps (name plus an optional command) and terminal its lines from `promo` frontmatter, and the content check rejects a flow or terminal template without them
- [ ] Titles break where the Writing Agent says (e.g. after the full-width comma) instead of mid-word
- [ ] Traditional Chinese renders correctly, and long titles wrap without overflowing
- [ ] The images do **not** carry the 「溫」 seal
- [ ] It writes a contact sheet HTML next to the PNGs, and the output folder is gitignored
- [ ] A new `promo` frontmatter field is validated by the content module and documented in GLOSSARY or the write-post skill

## Comments

- 2026-11-01: the Owner chose brand templates over an AI image model, and asked that the promo images leave out 「溫」 (the seal stays on the site, favicon and OG images).
- Reuse the shared pieces from 08 where they fit (`serifFont`, `lightColours`, the OG rendering). Rendering with Playwright is fine because this runs on a workstation or in CI, not in the Vercel build.
- 2026-11-01: the Owner picked templates from the prototype (branch `prototype/promo-images`, `.scratch/blog-v1/prototype/promo/render.ts`; contact sheet from `pnpm tsx` on that file). Use A (contour) for most Posts, C (flow) when a Post mainly introduces a process, and D (terminal) when it's mainly about coding. B (vertical title) was not picked. The write-post skill (12) tells the Writing Agent how to choose.
- The flow template draws its own steps rather than embedding a Mermaid diagram, so 15 no longer waits on 14.
