# Spec: Code-block checks and unchanged screenshots

**Status:** done

## Problem Statement

Writing the Go high-concurrency Post, the Writing Agent shipped code that didn't match its output: one program didn't compile, and several blocks were fragments shown with a full program's output. The Owner caught it by asking. The same check across the Series found a Go block in the goroutines Post with `func main` but no `package main` (fixed in PR #132). Nothing in `pnpm content:check` or any other command looks at a code block.

The same session read 28 screenshots, about 13 MB of the session's 20 MB of tool output, and ran out of context. Most rereads came after a code-only change that left every part of the page as it was, but `pnpm shots` gives no sign of which shots changed since the last run.

## Solution

- The content check fails a ```` ```go ```` block that has `func main` and no `package main`.
- `pnpm code:check <slug>` compiles a Post's whole programs: each Go block with `package main` through `gofmt -l` and `go vet`, each Python block through `python3 -m py_compile`. It runs on the Owner's machine only (CI has no Go or Python) and `write-post` step 3 requires it.
- `pnpm shots` remembers each shot's hash from its last run and marks every shot whose bytes are the same as last time, in its printed list and on the contact sheet. `write-post` step 7 lets a reshoot read only the shots it didn't mark.

## User Stories

1. As the Owner, I want a Go program in a Post to fail the content check when it lacks `package main`, so a Reader who copies it can run it.
2. As the Writing Agent, I want one command that compiles every whole program in a Post, so I find a broken block before the Owner does.
3. As the Writing Agent, I want `pnpm shots` to tell me which shots are the same as last run, so a reshoot after a small change costs only the shots that changed.

## Implementation Decisions

- **Content check rule**: in `src/content/content.ts`, beside the body's other checks. A `go` fenced block containing `func main` must contain `package main`; the error names the file, the block's line and the rule, as the other body errors do. A fragment (no `func main`) passes untouched: the published Posts have seven such fragments.
- **`code:check`**: a script under `scripts/`, `pnpm code:check <slug>` (or several slugs; none means every Post). Each block is written to its own folder in a temp directory: a Go block with `package main` gets a `go.mod` and runs `gofmt -l` (any file listed fails) and `go vet`; every `python` block runs `python3 -m py_compile`. It prints each block's Post, line and result, and exits non-zero when any fails. It neither runs the programs nor compares output: some are servers that never exit and timings vary run to run. Not part of `pnpm check`, since CI has neither toolchain.
- **Shots memory**: `pnpm shots` writes `{ <file name>: <sha256 of its bytes> }` for every PNG it wrote to `.shots-cache/last.json` (gitignored; outside `test-results/`, which `pnpm smoke` empties). On the next run, a shot whose file name and hash match last run's is printed with `unchanged` after its path and tagged 與上次相同 on the contact sheet. At the end of every run the file takes this run's hashes over last run's, keeping the entries of shots this run didn't take, so shooting another path doesn't forget the first. Exact bytes, not a pixel tolerance: if anti-aliasing or animation proves to make identical pages differ, a tolerance is a later change.
- **write-post**: step 3 gains `pnpm code:check <slug>` passing in its completion criteria; step 7 says a reshoot after a fix reads only the shots not marked `unchanged`.

## Testing Decisions

- The content-check rule gets fixtures in `src/content/fixtures/` and vitest cases through the content module's interface, as the other body rules do: a whole program passes, a fragment passes, `func main` without `package main` fails.
- `code:check` is tested on fixture MDX through its exported function: a good Go program, a Go program that fails vet, an unformatted Go program, a bad Python block. The tests skip when `go` or `python3` isn't on the PATH, so CI stays green.
- Shots memory: unit-test the comparison (previous map plus current hashes in, unchanged set out) without a browser; one real `pnpm shots` run twice in a row shows every shot `unchanged` the second time.

## Out of Scope

- Running programs and checking their output against the Post's output blocks.
- Languages other than Go and Python.
- Pixel-tolerant image comparison.
- Running `code:check` in CI.

## Further Notes

- Comes from the retro of the Go high-concurrency Post session (2026-11-17); the wording half shipped as PR #134.
