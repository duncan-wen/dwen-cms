# 03: Tags

**What to build:** Posts carry one or more Tags from an approved Tag list. A Reader sees Tags on Post lists and Post pages, can open `/tags` for all Tags with counts, and `/tags/<tag>` for that Tag's Posts. The content check rejects Tags that aren't lowercase or aren't in the approved list.

**Blocked by:** 02

**Status:** done

- [x] The approved Tag list is a data file in the content directory
- [x] The content check fails on an unapproved or non-lowercase Tag, with a readable error
- [x] The content module exposes "list Posts by Tag" and "list Tags with counts"
- [x] `/tags` and `/tags/<tag>` render; unknown Tags answer 404
- [x] Tags appear on Post list items and Post pages, linking to their Tag page
- [x] Unit tests cover filtering, counts and validation; smoke tests cover both routes
