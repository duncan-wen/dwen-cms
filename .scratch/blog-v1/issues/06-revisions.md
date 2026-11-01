# 06: Revisions show 「更新於」

**What to build:** The Owner records a Revision on a Published Post as a dated entry with a short note. The Post page shows 「更新於 <date>」 with the latest note. Corrections need no metadata and show nothing.

**Blocked by:** 01

**Status:** done

- [x] Frontmatter accepts optional Revision entries, each with a date and a note
- [x] The content check fails when a Revision date is before the Post's date
- [x] The content module exposes the Post's update date and note, taken from the latest Revision
- [x] The Post page shows 「更新於」 and the note only when a Revision exists
- [x] Unit tests cover update-date derivation and validation
