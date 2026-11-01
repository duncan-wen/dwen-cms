# 01: Design tokens and fonts

**What to build:** The site's colours become light and dark tokens, its headings switch to Noto Serif TC, and dates, Tags and code use JetBrains Mono. Post bodies and code blocks are restyled through the tokens. Existing pages keep their current layout but pick up the new palette and type. See the spec's Implementation Decisions and the prototype's direction A.

**Blocked by:** none

**Status:** done

- [x] Every colour is a token with a light and a dark value; no component uses a literal colour
- [x] Dark values apply under the system dark preference and under `data-theme="dark"`
- [x] Headings render in Noto Serif TC and body text in the system sans stack, loaded via `next/font`
- [x] Dates, Tags and code render in JetBrains Mono
- [x] Prose (lists, inline code, code blocks) is readable in both themes
