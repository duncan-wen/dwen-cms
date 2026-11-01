# 13: One check helper per frontmatter field

**What to build:** `loadContent` in `src/content/content.ts` validates `tags` and `previousSlugs` inline, while ticket 06 moved Revision validation into `checkRevisions`. Give each multi-rule frontmatter field its own `check<Field>` helper that reports problems and returns the parsed value, so `loadContent` reads as one line per field and the next field is added by writing a helper. The "must be a list" check, repeated for `tags`, `previousSlugs` and `revisions`, becomes one shared helper. Behaviour is unchanged: every content problem keeps its file, field, rule and message.

**Blocked by:** 06

**Status:** needs-triage

- [ ] `tags`, `previousSlugs` and `revisions` each validate through their own helper
- [ ] One helper owns the "must be a list" rule for frontmatter fields
- [ ] Every existing unit test passes unchanged

## Comments

Raised by the Standards reviewer in the issue-06 review (possible Divergent Change and Duplicated Code). Ticket 10 adds Pages to `loadContent` too; landing this first gives Page fields the same shape.
