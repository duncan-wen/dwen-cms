# 15: Promo images from brand templates

**What to build:** A command that turns a Post into ready-to-post promo images (文宣圖) for social media, using templates in the site's colours and fonts. A Writing Agent runs `pnpm promo <slug>` and gets PNGs to attach to the Draft PR; the Owner can also open them from a one-page contact sheet. No AI image model and no API key.

**Blocked by:** 07, 14

**Status:** ready-for-agent

- [ ] `pnpm promo <slug>` writes PNGs at the main social sizes: 1200×630 (Facebook / LinkedIn / X), 1080×1080 (square) and 1080×1350 (Instagram portrait)
- [ ] Each image shows the Post's title, and a short list of key points from optional `promo` frontmatter (falling back to the description)
- [ ] One template variant can place one of the Post's Mermaid diagrams (14) or co-located images as the visual
- [ ] Traditional Chinese renders correctly, and long titles wrap without overflowing
- [ ] The images do **not** carry the 「溫」 seal
- [ ] It writes a contact sheet HTML next to the PNGs, and the output folder is gitignored
- [ ] A new `promo` frontmatter field is validated by the content module and documented in GLOSSARY or the write-post skill

## Comments

- 2026-11-01: the Owner chose brand templates over an AI image model, and asked that the promo images leave out 「溫」 (the seal stays on the site, favicon and OG images).
- Reuse the shared pieces from 08 where they fit (`serifFont`, `lightColours`, the OG rendering). Rendering with Playwright is fine because this runs on a workstation or in CI, not in the Vercel build.
