# 03: Write down that only code scrolls sideways

**What to build:** During the Illustrations grilling we agreed "too wide → scroll in its own box", then found `pnpm shots` fails anything but a code block that scrolls sideways; the design had to change to phone copies. That rule lives only in `scripts/shots.ts` and `docs/agents/issue-tracker.md`. Add it to `CODING_STANDARDS.md` under Components, so design work finds it: in a body only code blocks scroll sideways; everything else fits a phone's 343px column (`PHONE_COLUMN_PX`), and the content check enforces it for Illustrations (`illustration-phone`) and Diagrams (`mermaid-phone-width`).

**Blocked by:** None (can start immediately)

**Status:** done

- [x] `CODING_STANDARDS.md` states the rule once, with pointers to the two content-check rules
- [x] No other doc restates it in different words

## Comments

- 2026-11-07 (agent): Added under Components in `CODING_STANDARDS.md`. `docs/agents/issue-tracker.md` and `scripts/shots.ts` describe what `pnpm shots` checks, and the write-post skill gives per-element advice (phone copies, two nodes per level); none restates the rule itself, so they stay as they are.
