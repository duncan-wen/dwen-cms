# Spec: Agent parts Animation

**Status:** ready-for-agent

## Problem Statement

The Post 「自己從頭做的 AI 工具，上線機率只有買來的一半：企業真的需要客製化 AI agent 嗎？」 (`enterprise-custom-ai-agent`) argues that most companies needn't build an AI agent from scratch: the part worth building is the hands (tools wired to the company's own systems), not the brain (the model). A Reader who doesn't code has never watched an agent work, so "brain" and "hands" stay abstract, and so does which of them is the same at every company. The Owner asked for an Animation of the hard concept.

## Solution

One Animation (「示意動畫」), `<AgentPartsAnimation />`, built like `<OversellAnimation />` on `AnimationFigure` and placed in that Post after 「用一個實際的問題走一遍，會更清楚哪一塊是誰的：」. The Mermaid diagram before it stays: the diagram shows the parts, the Animation one question going through them and which part is bought. The Post places it in its own PR, after this one merges.

## User Stories

1. As a Reader, I want to watch one question go to the brain, out to two tools that each reach a company system, and come back as an answer, so I see what an agent does that a chatbot doesn't.
2. As a Reader, I want the brain then marked as bought and the same everywhere, and the tools as built and only this company's, so I see which part is worth building.
3. As a Reader who asked for reduced motion, I want the finished frame, still.
4. As a screen-reader user, I want the same steps as text.

## Implementation Decisions

- **One-off component** in `src/components/agent-parts-animation/`, no props, its words in that folder, drawn with `scene-kit`'s canvas (500×340, 30fps) and colours and `flow-kit`'s `Box`, `Wire`, `span`, `useSeconds`. Abstract shapes only: rounded boxes, dots for a request travelling, short labels. Every label at 19px or more in scene pixels, so it reads at 375px.
- **Storyboard**, about 13 seconds:
  - Layout: 「問：訂單 A 為什麼還沒出貨？」 at the top; a box 「大腦」 under it; under that two boxes side by side, 「查訂單」 with 「公司 ERP」 and 「查物流」 with 「物流系統」, wired to the brain.
  - The question travels to the brain as a dot. The brain sends a dot to 查訂單; 「卡在倉庫」 appears under it and a dot comes back. Then the same to 查物流, with 「缺貨，週五補」. Then 「答：缺貨，預計週五出貨」 appears.
  - Act 2: the brain greys to `ink-soft` with 「買來的：每家都一樣」 beside it; then both tool boxes turn `accent` with 「自己做：只有你家有」.
  - Finished frame: everything above on screen, both tags shown.
  - Caption: 「示意動畫：AI agent 回答一個問題，大腦是買來的，連到公司系統的手腳要自己做。」
  - Screen-reader list:
    1. 員工問：訂單 A 為什麼還沒出貨？
    2. 大腦決定先查訂單，從公司 ERP 查到卡在倉庫。
    3. 再查物流，從物流系統查到缺貨，週五補貨。
    4. 大腦組成答案：缺貨，預計週五出貨。
    5. 大腦是買來的，每家公司都一樣；連到公司系統的手腳要自己做，只有你家有。
- **Component map**: joins `src/mdx/components.tsx`.

## Testing Decisions

- Smoke tests: the animation smoke Post (`e2e/content/posts/animation-smoke-post/`) places it, and it joins the loop in `e2e/smoke.spec.ts` that tests the oversell and central-stock Animations: caption and screen-reader list; waits until scrolled to, plays, finishes and offers 重播; with reduced motion it is `still` with no 重播.
- `pnpm shots /posts/animation-smoke-post` and its mid-play crops with `?at=`: read by the agent in both themes at both widths, and shown to the Owner.

## Out of Scope

- The Post itself, which ships in its own PR.
- An Animation of the demo-versus-production gap (the Owner chose this storyboard over it on 2026-11-18).

## Further Notes

- Storyboard agreed with the Owner on 2026-11-18 in chat.

## Comments

- Built in ticket 01. Changes from the wording above, from review: the scene runs 12 seconds; a request is a pulse of three dots, as in flow-kit's other scenes; and a dashed `accent` frame round both tools and their results carries 「自己做：只有你家有」 just under it, so the tag reads as the tools' and not the answer's, with the answer below it.
