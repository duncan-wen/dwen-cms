# 04: The Writing Agent suggests a Series

**What to build:** `.claude/skills/write-post` checks `content/series.yml` while drafting; when the Topic fits a Series, the Draft adds `series` and the PR body says so for the Owner's Review; a new Series goes into `series.yml` in the same PR as its first Post, as `../spec.md` describes.

**Blocked by:** 01

**Status:** done

- [x] `write-post` tells the agent to read `content/series.yml` and add `series` when the Topic fits one
- [x] The PR body template names the suggested Series, so the Owner can keep or drop it
- [x] `write-post` says how to add a new Series in the same PR as its first Post
