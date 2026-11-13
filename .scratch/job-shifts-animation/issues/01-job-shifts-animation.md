# 01: A Post plays the job shifts animation

**What to build:** `<JobShiftsAnimation />` in a Post body draws the job shifts table with Remotion's Player and plays it once when the Reader scrolls to it, as `../spec.md` describes: three eras, each row greying out the old work, growing an arrow and lighting up the new work, then holding the finished table with a 「重播」 button. Start from the Agent animation in `src/components/agent-animation/` (Player setup, reduced-motion hook, theme tokens) and keep this one in its own folder.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] `GLOSSARY.md` has **Animation** (shown to readers as 「示意動畫」), and **Agent animation** reworded as the home page's Animation, as the spec words them
- [x] `<JobShiftsAnimation />` is in the MDX component map and takes no props
- [x] The scene holds exactly the spec's table, headers and example line; each cell fits on one line at 375px
- [x] Rows play top to bottom with the spec's motion; the whole scene runs 15–20 seconds at 30fps; no sound
- [x] Playback starts when half the animation is visible, plays once, stops on the finished frame, and 「重播」 plays it again from the start
- [x] With reduced motion, the finished frame shows still and there is no 「重播」 button
- [x] The animation is hidden from screen readers; a visually hidden list carries each era's old and new work and the example line; the caption reads 「示意動畫：三次技術轉變中消失與崛起的工作。」
- [x] Smoke uses a Post in `e2e/content` with `<JobShiftsAnimation />`, and checks:
  - the caption and the hidden list's three eras are on the page;
  - scrolled into view without reduced motion, it starts playing and 「重播」 appears once it has finished;
  - with reduced motion there is no 「重播」 button
- [x] `pnpm shots` of that Post in light and dark at 1280px and 375px, read before ticking; nothing scrolls sideways or clips (Owner checks the finished frame)

## Comments

- 2026-11-13: the Owner approved the finished frame from the `pnpm shots` contact sheet.
