# Spec: Job shifts animation in a Post

**Status:** done

## Problem Statement

The Owner is writing a Post whose point is that AI has put us in a transition, like the Industrial Revolution: some jobs disappear and new ones rise. The pattern repeats across eras, and a Reader takes it in faster by watching it happen than by reading three paragraphs. A Post body has no way to show anything animated today: its components are `Callout`, `Mermaid`, `SlideDeck` and images, and the glossary's only animation, the Agent animation, belongs to the home page.

## Solution

A silent animation, drawn live in the page with Remotion's Player like the Agent animation, placed in a Post body as `<JobShiftsAnimation />`. It is a table that builds itself row by row: each row is an era, the left column the work that was pushed out, the right the work that rose. It plays once when the Reader scrolls to it and stops on the finished table, with a 「重播」 button.

Its main job is to help the Reader see the pattern; showing the Owner's technical skill is a side effect.

## Decisions

- **One-off component.** Built for this Post only, with its content in the component's own folder (like `src/components/agent-animation/`), and no props. It becomes a general component only when a second Post needs one.
- **Content**, column headers 「被淘汰的」 and 「新崛起的」, each cell about 8 characters at most:

  | 時代 | 被淘汰的 | 新崛起的 |
  | --- | --- | --- |
  | 工業革命 | 手工織布工 | 機械師、工廠技師 |
  | 電腦普及 | 打字員、計算員 | 程式設計師 |
  | AI | 翻文件寫程式 | 駕馭 AI 的人 |

  Under the AI row, a smaller line: 「例：護理師轉職 AI 應用工程師」.
- **Motion per row:** the row's era and old work appear; the old work greys out and is struck through; an arrow grows to the right; the new work lights up in the accent colour. Rows play top to bottom, each 5–6 seconds, about 15–20 seconds in all at 30fps.
- **Playback:** starts once, when half the animation is on screen; stops on the finished frame, which is the whole table; a 「重播」 button at its bottom right plays it again from the start. No other controls, no loop, no sound (no voice-over: browsers block autoplaying sound, Readers read with sound off, and the content is already on screen).
- **Reduced motion:** Readers who ask for it see the finished frame, still, and no 「重播」 button. `pnpm shots` asks for reduced motion, so its screenshots show that frame.
- **Theme and size:** colours and fonts are the site's tokens, so it follows the light and dark themes. It is at most 500px wide, so on desktop its text sits near the body's size instead of scaling up to the 640px column; text stays readable at 375px.
- **Accessibility:** the animation is hidden from screen readers, and a visually hidden list carries the same table: each era with what was pushed out and what rose, plus the example line. A visible caption under it: 「示意動畫：三次技術轉變中消失與崛起的工作。」
- **Glossary:** a new term **Animation**: an animated figure on the home page or in a Post, with nothing interactive beyond replaying it and no AI running, so it is not a Demo; shown to readers as 「示意動畫」. **Agent animation** is reworded as the home page's Animation.
- **Review:** the Owner reviews the finished frame from `pnpm shots` screenshots. The agent checks playback itself (start on scroll, row order, stop on the last frame, 重播), with the smoke test and, if needed, on the Vercel preview. The Owner may watch it on the preview but doesn't have to.
- **Out of scope:** the Post itself (written afterwards with `write-post`, once this has merged), a general timeline component, sound, a video export, screenshots taken mid-play (`.scratch/shots-mid-animation/`).

## Comments

- Built in ticket 01. Two changes from the first wording, found in the screenshots and the review: the Animation is capped at 500px wide (filling the 640px column scaled its text to about 30px), and the glossary entry allows replaying, since 「重播」 is the one thing a Reader can press.
