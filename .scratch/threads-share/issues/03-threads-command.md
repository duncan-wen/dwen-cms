# 03: pnpm threads

**What to build:** `pnpm threads <slug>` shows what would be posted for a live Published Post; `--post` posts its Threads share as a TEXT post with the Post's canonical URL as link attachment and its topic tag as the topic-tag parameter, fetches the permalink and writes it back as the `posted:` line. Each run refreshes the token when it is over 24 hours old and warns from ten days before expiry. What it shares with `pnpm linkedin` moves into one helper both use. See `../spec.md`.

**Blocked by:** 01, 02

**Status:** done

- [x] Preview prints the text, the topic tag and the link, and posts nothing
- [x] `--post` refuses a file that already has `posted:`, and a Post that isn't live
- [x] A successful post writes the permalink as the first `posted:` line; a post with no permalink is reported
- [x] The token is refreshed and written back with its date when over 24 hours old; the warning starts ten days before expiry
- [x] `pnpm linkedin` uses the shared helper and its preview still works on a Post
- [x] vitest covers the pure helpers (topic tag off the text, refresh and warning decisions)
- [x] First real post, on the Owner's yes after the preview (proposed: `ai-transition-era`): the card, topic tag and recorded URL are checked, and the 500-character count is confirmed or tightened

## Comments

- 2026-11-13: First real post, on the Owner's yes: `ai-transition-era` → https://www.threads.com/@lumpa7223/post/Dfq3UCEkyCn. Read back through the API: `TEXT_POST`, `topic_tag` AI, link attachment the Post's URL, 172 characters accepted. The Owner's screenshot shows the card draws the Post's OG image and title, so Threads reads the page's OG tags, and the topic tag shows beside the account name. The 500-character rule stands: a 172-character post doesn't test the limit, so it's tightened only if a longer one is refused. `pnpm linkedin ai-transition-era` preview works on the shared helper.
