# 01: Page shots also crop each Illustration and Diagram

**What to build:** `pnpm shots` writes only full-page screenshots, up to 4,374px tall, so checking one Illustration or Diagram meant writing a throwaway Playwright script three times in the Illustrations build. Have `scripts/shots.ts` also screenshot every visible `span.illustration` and `figure.mermaid-diagram` on each shot path, per theme and width, into `test-results/shots/`, and show them on the contact sheet `test-results/shots/index.html` under their page.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] `pnpm shots /posts/typography-sample` writes one crop per Illustration and Diagram per theme and width, named after the page and its position
- [x] The contact sheet shows the crops under their page's full shots
- [x] The overflow check and its failure output are unchanged
- [x] The write-post skill's step 7 and `docs/agents/issue-tracker.md` (Visual tickets) mention the crops
- [x] The Owner has looked at the new contact sheet and said OK

## Comments

- 2026-11-07: The Owner looked at the contact sheet for `/posts/typography-sample` and said OK.
