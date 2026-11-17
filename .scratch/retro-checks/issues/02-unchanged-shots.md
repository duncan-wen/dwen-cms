# 02: Unchanged shots

**What to build:** `pnpm shots` remembers each shot's hash in `.shots-cache/last.json` and marks shots identical to last run, in its printed list and on the contact sheet; `write-post` step 7 lets a reshoot read only the rest. See `../spec.md`.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] `pnpm shots` writes `.shots-cache/last.json` (file name to sha256) at the end of each run; `.shots-cache/` is gitignored
- [x] A shot whose name and hash match last run is printed with `unchanged` and tagged 與上次相同 on the contact sheet
- [x] The comparison is unit-tested without a browser
- [x] Two `pnpm shots` runs in a row on the same path mark every shot `unchanged` the second time
- [x] `write-post` step 7 says a reshoot after a fix reads only the shots not marked `unchanged`
