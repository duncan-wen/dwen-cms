# 01: Code-block checks

**What to build:** The content check's `package main` rule, and `pnpm code:check`, with `write-post` step 3 requiring it. See `../spec.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] The content check fails a `go` block with `func main` and no `package main`, naming the file, line and rule; a whole program and a fragment pass; vitest covers all three through fixtures
- [ ] `pnpm code:check <slug>…` (no slug: every Post) compiles each Go `package main` block with `gofmt -l` and `go vet`, and each Python block with `py_compile`, prints each block's result and exits non-zero on any failure
- [ ] Its tests cover a good Go program, a vet failure, unformatted Go and bad Python, and skip without `go` or `python3`
- [ ] `pnpm code:check` passes on every published Post
- [ ] `write-post` step 3 lists `pnpm code:check <slug>` passing among its completion criteria
