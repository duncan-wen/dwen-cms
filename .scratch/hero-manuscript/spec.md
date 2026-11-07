# Spec: Manuscript paper in the home hero

**Status:** ready-for-agent

## Problem Statement

From 640px up, the home page's headline is set vertically on the right and is much taller than the introduction beside it. The introduction sits at the bottom of its column, so the top left of the hero is an empty block of paper.

## Solution

Fill that space with a sheet of vertical manuscript paper (稿紙): faint squares in columns that run right to left, with a narrow gap between columns. The vertical headline reads as the first lines written on the sheet, and the empty squares are what's still to be written, which matches the headline's 「再把過程寫下來」.

## Decisions

- Picked in chat over two alternatives: showing the newest Post there (repeats the 最新文章 grid below) and shrinking the hero (gives up the headline's scale).
- The grid fills the introduction's column above the introduction. Only whole columns show: they're spread evenly across the width, so none is cut off at either edge.
- One square is about one headline character (font size plus its letter spacing), so the sheet and the headline are on the same scale.
- Lines use the `--rule` token, so both themes stay faint. The grid fades out downwards before it reaches the introduction, so the text never sits on lines.
- Decorative: hidden from assistive tech, no motion.
- Phones (under 640px) don't show it: the headline is horizontal there and there is no empty block.
