# 05: Takedown and not-found

**What to build:** The Owner takes down a Post by deleting it and adding its Slug to the taken-down Slug list. Its URL then answers 410 Gone with a short explanation page. A taken-down Slug can never be reused as a current or previous Slug. URLs that never existed get a helpful 404 page.

**Blocked by:** 04

**Status:** ready-for-agent

- [ ] The taken-down Slug list is a data file in the content directory
- [ ] Resolving a taken-down Slug returns a Takedown marker
- [ ] Reusing a taken-down Slug fails the content check
- [ ] A taken-down Slug answers 410 with an explanation page; an unknown URL answers 404 with a way back to content
- [ ] Unit tests cover resolution and the reuse rule; smoke tests cover 410 and 404
