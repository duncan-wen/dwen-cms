# 01: `?at=` mid-play shots

**What to build:** `?at=` on a `pnpm shots` path, the mid-play crops, their place on the contact sheet, and the two doc lines. See `../spec.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `?at=2,5` parses to seconds; a bad value fails naming the path; unit-tested without a browser
- [ ] Each Animation is shot mid-play at each time, in both themes at 1280px, cropped, named as the spec says
- [ ] A Post Animation's clock starts when it turns `playing`; the Agent animation's at page load
- [ ] The contact sheet shows the mid-play shots beside each Animation's finished frame
- [ ] `pnpm shots '/posts/animation-smoke-post?at=2,6'` writes 12 mid-play crops that differ from the finished frames
- [ ] `docs/agents/shipping.md` Screenshots and `write-post` step 7 tell an agent to use it after changing an Animation
