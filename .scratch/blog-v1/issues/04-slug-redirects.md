# 04: Slug changes redirect

**What to build:** The Owner can change a Post's Slug and record the previous ones in frontmatter. Old URLs permanently redirect to the current Slug. The content check rejects a previous Slug that collides with any current Slug or is claimed by two Posts.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Frontmatter accepts an optional list of previous Slugs, validated as kebab-case
- [ ] Resolving a previous Slug returns a redirect to the current Slug
- [ ] Collisions fail the content check with a readable error
- [ ] Requesting an old Slug answers a permanent redirect (301/308) to the new URL
- [ ] Unit tests cover resolution and collisions; a smoke test covers the redirect
