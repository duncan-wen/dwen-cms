# 01: The job shifts Animation tells its story in scenes

**What to build:** Replace the table in `src/components/job-shifts-animation/` with the three illustrated scenes and the summary frame in `../spec.md`, following the look of the approved prototype on `prototype/job-shifts-scenes`. `<JobShiftsAnimation />`, its playback, 「重播」, reduced motion, caption and hidden list keep working as they do.

**Blocked by:** None (the Owner approves the prototype before this starts)

**Status:** done

- [x] The 工業革命, 電腦普及 and AI scenes each show the old way, the turn and the new role with the spec's objects and motion; people are faceless geometric figures; the AI scene's new role has a medical cross
- [x] Each scene has one short label; the Animation runs 20–25 seconds at 30fps; no sound
- [x] The finished frame is the summary, three rows top to bottom; it reads at 375px and in both themes
- [x] Playback, 「重播」, reduced motion, caption and hidden list behave as before; the existing smoke tests pass, and the one that checks the finished frame checks the summary
- [x] Captures taken mid-play of each scene, read by the agent; `pnpm shots` of the smoke Post and of `/posts/ai-transition-era` (`--content content`) in light and dark at 1280px and 375px, run last (Owner checks)

## Comments

- 2026-11-13: the Owner approved the mid-play captures and the `pnpm shots` contact sheet.
