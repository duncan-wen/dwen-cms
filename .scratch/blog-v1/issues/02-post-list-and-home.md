# 02: Post list and home page

**What to build:** A Reader can browse all Published Posts newest first at `/posts`, each showing title, date and description. The home page introduces the Owner briefly and shows the latest Posts.

**Blocked by:** 01

**Status:** done

- [x] `/posts` lists every Published Post, newest first
- [x] The home page shows a short intro and the latest few Posts, linking to `/posts`
- [x] Unit tests cover ordering via the content module
- [x] Smoke tests confirm `/` and `/posts` answer 200

## Comments

- 2026-11-01: The home page shows the latest 5 Posts. Posts that share a date are listed in Slug order so the order is deterministic. The home intro is placeholder copy in the Owner's voice: replace it once the Owner's sample texts arrive, alongside issue 10.
