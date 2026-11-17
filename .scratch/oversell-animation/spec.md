# Spec: Oversell and central-stock Animations

**Status:** done

## Problem Statement

The Post 「同一個程式開 3 台，100 件商品賣出 300 件？用 Go 看懂高併發與分散式」 explains its two hardest turns in prose, numbers and two Mermaid diagrams: why 3 copies of a shop sell 300 of 100 items, and why moving the stock to one central service fixes that but makes it a single point of failure. The diagrams show the layout but not how it plays out over time, which is the part a Reader has to picture. The Owner asked for Animations of the hard parts.

## Solution

Two Animations (「示意動畫」), built like `<JobShiftsAnimation />` and placed in that Post's body:

- `<OversellAnimation />` at the start of 「為什麼會賣超：每台都有自己的帳本」, after its first paragraph.
- `<CentralStockAnimation />` in 「新的問題：總倉倒了怎麼辦」, after 「1,000 人全部買不到」.

Both Mermaid diagrams stay: the diagram shows the layout, the Animation how it unfolds. The Post change is a Revision, made after this spec's code merges.

## User Stories

1. As a Reader, I want to watch 3 shops each count their own 100 down to 0 while the sold counter passes 100 and reaches 300, so I see why a lock in one process can't stop overselling.
2. As a Reader, I want to watch the central stock sell exactly 100 and then, once it is down, every request fail while the shops are still up, so I see what a single point of failure means.
3. As a Reader who asked for reduced motion, I want the finished frame, still.
4. As a screen-reader user, I want the same steps as text.

## Implementation Decisions

- **Shared player**: the playback logic in `src/components/job-shifts-animation/job-shifts-animation.tsx` (start once when half is on screen, stop on the last frame, 「重播」 at the bottom right, reduced motion shows the finished frame still with no button, `data-playback` of `waiting`/`playing`/`finished`/`still`, Animation hidden from screen readers, a visually hidden list, a visible caption, at most 500px wide) moves into one shared component that all three Animations use. `JobShiftsAnimation` changes only inside: its smoke tests pass unchanged and its screenshots stay the same.
- **One-off components** in `src/components/oversell-animation/`, no props, content in the folder. Drawn with the site's tokens through `scene-kit` (`INK`, `SOFT`, `ACCENT`, `RULE`, `PAPER`, the `--code-*` colours) on the same 500×340 canvas at 30fps. Abstract shapes only: dots for buyers, rounded boxes for the load balancer, shops and central stock, numbers and short labels. Every label readable at 375px.
- **`<OversellAnimation />`**, about 12 seconds:
  - Left, a crowd of dots labelled 「1,000 人搶購」; middle, a box 「分流器」; right, 3 boxes 「9001」「9002」「9003」, each with its own ledger 「庫存 100」.
  - Dots flow through the load balancer and are dealt to the shops in turn, each shop its own colour. Each ledger counts 100 → 0. A 「已賣出」 counter at the bottom climbs 0 → 300, turns to the warning colour once past 100, and 「實際只有 100 件」 appears beside it.
  - Finished frame: all three ledgers at 0, 「已賣出 300」 in the warning colour, and 「3 本帳本，各賣各的」.
  - Caption: 「示意動畫：3 家店各記一本 100 件的帳本，加起來賣出 300 件。」
  - Screen-reader list: 1,000 人搶購，分流器輪流分給 3 家店。／每家店各記一本 100 件的帳本，各自扣到 0。／加起來賣出 300 件，實際只有 100 件。
- **`<CentralStockAnimation />`**, about 14 seconds, two acts:
  - Act 1 「庫存交給總倉」: the same layout plus a box 「總倉 100」 below the shops; the shops show no ledger. Each dot goes load balancer → shop → central stock. The central stock counts 100 → 0 and 「已賣出」 stops at 100; after that dots come back grey, 「賣完了」.
  - Act 2 「總倉關掉」: a heading 「再來 1,000 人」; the central stock greys out with an ✕; dots go down to it, turn to the warning colour at the ✕, and a 「失敗」 counter climbs to 1,000. The 3 shops stay lit (still running).
  - Finished frame: the central stock with its ✕, the 3 shops lit, 「失敗 1,000」.
  - Caption: 「示意動畫：庫存交給總倉後只賣出 100 件；總倉一倒，3 家店都活著，1,000 人卻全部買不到。」
  - Screen-reader list: 3 家店不記庫存，每次都先問總倉。／總倉從 100 扣到 0，剛好賣出 100 件，其餘的人收到賣完了。／總倉關掉後再來 1,000 人：3 家店都還在，但問不到庫存，1,000 人全部失敗。
- The dots stand for many buyers; only the counters carry the real numbers.
- **Component map**: both join `src/mdx/components.tsx`, and `CODING_STANDARDS.md`'s shared-piece list names the shared player.

## Testing Decisions

- Smoke tests: the animation smoke Post (`e2e/content/posts/animation-smoke-post/`) places all three Animations. For each: its caption and screen-reader list; it waits until scrolled to, plays, finishes and offers 重播; with reduced motion it is `still` with no 重播. The existing `JobShiftsAnimation` tests pass unchanged.
- `pnpm shots /posts/animation-smoke-post`: the finished frames of both new Animations in both themes at both widths, read by the agent and shown to the Owner; `JobShiftsAnimation`'s crops are byte-identical to `main`'s.

## Out of Scope

- The Post change itself: a Revision through `write-post`'s CHANGING-A-POST.md (`revisions` note 「加上示意動畫」) after this merges. No reshare.
- An animation of many requests waiting at once (the Post's numbers and Callout carry it).
- A general architecture-animation component, sound, video export.

## Further Notes

- Agreed with the Owner on 2026-11-17 in chat.

## Comments

- Built in PR #139. Three changes from the wording above, kept with the Owner's OK on 2026-11-17: the central stock sits to the right of the shops, not below them, so requests flow left to right; act 2's heading reads 「總倉關掉，再來 1,000 人」; and act 2 fades 「已賣出」 out for 「失敗」, since it is a new crowd. `pnpm shots` also crops each Animation.
