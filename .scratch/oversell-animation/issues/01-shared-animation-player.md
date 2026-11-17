# 01: Shared Animation player

**What to build:** Move `JobShiftsAnimation`'s playback, 重播, reduced-motion, screen-reader list and caption into one shared component, and rebuild `JobShiftsAnimation` on it. See `../spec.md`.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] One shared component carries the playback states, 重播, reduced motion, the hidden list and the caption
- [x] `JobShiftsAnimation` uses it; its smoke tests pass unchanged
- [x] Its `pnpm shots` crops are byte-identical to `main`'s
- [x] `CODING_STANDARDS.md`'s shared-piece list names it
