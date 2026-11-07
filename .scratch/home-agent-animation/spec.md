# Spec: AI agent animation on the home page

**Status:** ready-for-agent

## Problem Statement

From 640px up, the home page's headline is set vertically on the right and is much taller than the introduction beside it, so the top left of the page's opening section is an empty block. The Owner wants that space to show technical skill rather than decoration.

## Solution

A short looping animation, drawn live in the page with Remotion's Player, shows an AI agent answering a question by calling a tool: the question arrives, the agent calls a tool with its arguments, the tool's rows come back, and the agent answers in one sentence. It matches the headline 「把 AI 做進真的產品裡」.

## Decisions

- Picked in chat over two other scenes (this site's publishing pipeline, code typed and run) and over a pre-rendered video. A manuscript-paper sheet was tried first and dropped (PR #57).
- The scene, top to bottom, each step joined to the next by a rail on the left, since the steps are a sequence:
  1. 使用者: 上個月哪個商品退貨最多？
  2. 呼叫工具: `query_orders({ month: "2026-10", status: "returned" })`, coloured with the site's code colours.
  3. 工具回傳: 藍芽耳機 42 筆, 行動電源 17 筆, each with a bar to scale.
  4. AI: 藍芽耳機，42 筆，是第二名的兩倍多。
- About 12 seconds at 30fps. Each step types or grows in, the whole scene holds, then fades out and loops. It autoplays muted with no controls.
- The data is made up, so a small caption under it says it is an illustration with made-up data. Screen readers get a one-sentence description instead of the animation.
- Colours and fonts come from the site's tokens, so it follows the light and dark themes.
- From 640px it fills the space above the introduction. On phones it sits below the introduction's links.
- Readers who ask for reduced motion see the finished last frame, still. `pnpm shots` asks for reduced motion too, so its screenshots always show that frame.
- It is not a Demo in the glossary's sense: nothing is interactive and no AI runs. In code it is the agent animation.
