# 01: Shared Animation player

**What to build:** Move `JobShiftsAnimation`'s playback, 重播, reduced-motion, screen-reader list and caption into one shared component, and rebuild `JobShiftsAnimation` on it. See `../spec.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] One shared component carries the playback states, 重播, reduced motion, the hidden list and the caption
- [ ] `JobShiftsAnimation` uses it; its smoke tests pass unchanged
- [ ] Its `pnpm shots` crops are byte-identical to `main`'s
- [ ] `CODING_STANDARDS.md`'s shared-piece list names it
