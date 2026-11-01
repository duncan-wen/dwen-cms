# 12: write-post skill

**What to build:** A project skill that lets a Writing Agent turn a topic into a valid Draft PR. It covers:
- the Owner's voice
- frontmatter and file layout, including co-located images
- choosing Tags from the approved list (proposing a new one only with a reason in the PR)
- telling a Correction from a Revision and how to record a Revision
- changing a Slug safely
- one concern per PR, with new MDX components in their own PR first
- drawing flowcharts and architecture diagrams in Mermaid (14)
- generating promo images with `pnpm promo` and attaching them to the PR (15)
- running the content check before opening the PR

**Blocked by:** 03, 04, 06, 07, 14, 15

**Status:** needs-info

- [ ] All rule sections are written and match the content module's actual validation
- [ ] The voice section is derived from the Owner's 2–3 sample texts (needs-info until provided)
- [ ] A Writing Agent given only a topic produces a PR that passes CI
