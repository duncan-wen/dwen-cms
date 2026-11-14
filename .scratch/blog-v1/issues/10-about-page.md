# 10: About Page

**What to build:** Pages become a content type: undated MDX with title and description, outside listings. `/about` introduces the Owner and states, once for the whole site, that content is drafted with AI and reviewed by the Owner. Use placeholder copy until the Owner provides 2–3 sample texts.

**Blocked by:** 01

**Status:** done

- [x] The content module loads and validates Pages and exposes "get a Page by name"
- [x] `/about` renders from MDX, with placeholder copy and the AI disclosure
- [x] Pages don't appear in Post lists or RSS
- [x] Unit test covers Page loading; smoke test confirms `/about` answers 200
- [x] Final copy is drafted from the Owner's sample texts once provided (follow-up)

## Comments

- Pages are kept out of the Post list (unit-tested), but there is no RSS feed yet, so the RSS half of that box moved to ticket 08. Of the boxes left open, only the Owner's final copy is outstanding here.
- 2026-11-14: ticked the Pages box: ticket 08 built `/feed.xml` and ticked 「The RSS feed lists Published Posts, newest first, and no Pages」.
- 2026-11-14: the Owner confirmed the live `/about` copy is the final copy.
