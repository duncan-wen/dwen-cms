# Changing a Published Post

For a change to a Post already on `main`. Branch off `origin/main` as `revise-<slug>`, make the one change below, then continue from step 6 of [SKILL.md](SKILL.md) (check, promo images if the title or `promo` changed, Draft PR). The PR body says which kind of change it is and why.

## Correction or Revision

Ask: does the change alter what a Reader learns from the Post?

- **No: a Correction.** A typo, a broken link, a clearer phrasing that says the same thing, a fixed image. Edit the body and nothing else; Corrections leave no trace in frontmatter and show no date.
- **Yes: a Revision.** A new section, a changed recommendation, a corrected fact or number, results that went stale. Edit the body and append an entry to `revisions`:

  ```yaml
  revisions:
    - date: 2026-11-20      # YYYY-MM-DD, on or after the Post's date
      note: 補上效能比較     # short Traditional Chinese, what changed for the Reader
  ```

  Keep earlier entries; the Post's `date` never changes. The entry with the latest date is shown to Readers as 「更新於」 with its note (`checkRevisions` in `src/content/content.ts`).

When unsure, it is a Revision if a Reader who read the old version would want to know.

## Changing the Slug

Rename the folder `content/posts/<old>/` to `content/posts/<new>/` and add the old Slug to `previousSlugs` (keeping any already there). The old URL then redirects permanently to the new one. The content check enforces:

- every previous Slug is lowercase English kebab-case;
- no previous Slug equals any Post's current Slug, and no two Posts claim the same one;
- no current or previous Slug is in `content/taken-down.yml`, so a taken-down Slug is never reused.

## Takedown

Only when the Owner asks for one. Delete the Post's folder (its images go with it) and add its Slug to `content/taken-down.yml`, creating the file as a YAML list if it doesn't exist. Its URL then answers 410 Gone. Previous Slugs of the deleted Post leave with it, so list each of them in `content/taken-down.yml` too if they should answer 410.
