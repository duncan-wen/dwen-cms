# 07: Images and MDX components

**What to build:** Posts can include images stored next to them, rendered optimised and correctly sized, plus an optional cover image. Posts can use a callout and get syntax-highlighted code blocks. All MDX components come from a single component map, the extension point phase-2 Demos will plug into.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Co-located images render optimised with correct dimensions and no layout shift
- [ ] An optional cover image is supported in frontmatter
- [ ] A referenced image that doesn't exist fails the content check
- [ ] Callout and syntax-highlighted code blocks work in the sample Post
- [ ] All MDX components are provided through one component map

## Comments

- Code-block colours follow visual-design/01's tokens in both themes; pick a highlighter whose output can be styled through CSS variables instead of a fixed theme.
