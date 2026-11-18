# Spec: Forgetting Animation

**Status:** done

## Problem Statement

The Owner's Post on whether a company should fine-tune its own model (`enterprise-custom-ai-agent`) argues that fine-tuning can break what a model could already do, so a company should first evaluate whether the model as it is meets the need, and fine-tune only if it doesn't. "Fine-tuning makes a model forget" (catastrophic forgetting) is the concept a Reader who doesn't code can't picture: why would teaching a model one thing cost it others, and why do LoRA and prompting with retrieval (RAG) cost less? The Owner asked for an Animation of it.

## Solution

One Animation (「示意動畫」), `<ForgettingAnimation />`, built like `<OversellAnimation />` on `AnimationFigure` and placed in that Post where it explains forgetting. The Post places it in its own PR, after this one merges.

## User Stories

1. As a Reader, I want to watch one model learn the company's product knowledge three ways, side by side, and see what each way costs its other abilities, so I see why fine-tuning isn't the first thing to try.
2. As a Reader, I want to be told the numbers are illustrative, so I don't take them as measured.
3. As a Reader who asked for reduced motion, I want the finished frame, still: all three columns.
4. As a screen-reader user, I want the same steps as text.

## Implementation Decisions

- **One-off component** in `src/components/forgetting-animation/`, no props, its words and numbers in that folder, drawn with `scene-kit`'s canvas (500×340, 30fps) and colours and `flow-kit`'s `span`, `useSeconds`, `WARN`. Abstract shapes only: bars and short labels, every label at 19px or more in scene pixels.
- **Layout**: a grid. Rows, labelled at the left: 「產品知識」 (the target), 「寫程式」, 「照格式回答」, 「拒絕危險問題」. Columns, headed: 「全參數微調」, 「LoRA」, 「提示詞＋RAG」. Each cell is a horizontal bar with a faint outline of where the ability started.
- **Storyboard**, about 13 seconds: the columns play in turn, left to right. In each, the bars start at the starting values and move to the column's values; 產品知識 fills in `accent`, a bar that falls well below its outline turns the warning colour. A short note appears under each column once it settles: 「學多忘多」, 「學少忘少」, 「不動模型」.
- **Values** (illustrative, out of 100): start 20 / 80 / 85 / 90; 全參數微調 95 / 40 / 30 / 15; LoRA 65 / 72 / 76 / 82; 提示詞＋RAG 75 / 80 / 85 / 90.
- **Finished frame**: all three columns settled, with their notes.
- **Caption**: 「示意動畫：同一個模型用三種方法學公司的產品知識，數字只是示意。全參數微調學最多也忘最多；LoRA 學得少、忘得也少；提示詞加 RAG 不改模型，原本的能力都在。」
- **Screen-reader list**:
  1. 同一個模型原本會寫程式、照格式回答、拒絕危險問題，但不懂公司的產品。
  2. 全參數微調：產品知識學得最多，其他三項能力大幅下降。
  3. LoRA：產品知識學得比較少，其他能力只掉一點。
  4. 提示詞加 RAG：不改模型，查文件回答產品問題，其他能力不變。
  5. 數字只是示意，不是實測。
- **Component map**: joins `src/mdx/components.tsx`.

## Testing Decisions

- Smoke tests: the animation smoke Post places it, and it joins the loop in `e2e/smoke.spec.ts` that tests the oversell and central-stock Animations: caption and screen-reader list; waits until scrolled to, plays, finishes and offers 重播; with reduced motion it is `still` with no 重播.
- `pnpm shots /posts/animation-smoke-post` and its mid-play crops with `?at=`: read by the agent in both themes at both widths, and shown to the Owner.

## Out of Scope

- The Post itself, which ships in its own PR.
- Measured numbers: the values are illustrative, and the caption says so.

## Further Notes

- Storyboard agreed with the Owner on 2026-11-18 in chat (「微調後的能力條」: full fine-tuning, LoRA, prompting with RAG). The forgetting examples it stands for are from 李宏毅's 2025 lecture on post-training and forgetting, cited in the Post.

## Comments

- Built in ticket 01. From review: each cell draws a faint track of a full bar with a dashed tick where the ability started, rather than an outline the width of the start; the row label 「產品知識」 is drawn in `accent` like its bar, and the note 「學多忘多」 in the warning colour. `CODING_STANDARDS.md` now names flow-kit's clock and warning colour as the way any Animation gets them.
