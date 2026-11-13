# Spec: Sharing Posts on Threads

**Status:** ready-for-agent

## Problem Statement

The Owner shares each Post on LinkedIn with one command, but LinkedIn reaches mostly people who already know them. Threads is busy in Taiwan and shows posts to people who don't follow the account yet, which suits the Owner's opinion Posts. Today sharing on Threads would be by hand, with text written for LinkedIn's more formal tone, and `write-post` only ever offers LinkedIn.

## Solution

- A Post can carry a Threads share next to its LinkedIn share: `threads.txt`, short and casual, ending in one topic tag, checked by the content check.
- `pnpm threads <slug>` previews it and `pnpm threads <slug> --post` posts it from the Owner's own Threads account as a text post with a link card to the live Post, then records the post's URL.
- A one-time wizard walks the Owner through creating the Meta app and authorising it, and writes the first token into `.env.local`; after that the script refreshes the token itself.
- Once a Post is live, `write-post` asks which platforms to share it on and previews each before posting.

Research against Meta's documentation is in `research.md`, next to this spec.

## User Stories

1. As the Owner, I want `write-post` to draft a Threads share with each Post, so that I review it along with the Post and the LinkedIn share.
2. As the Owner, I want the Threads share in a casual, short voice opening on the same hook as the title, so that it reads naturally on Threads.
3. As the Owner, I want to be asked which platforms to share a live Post on (LinkedIn, Threads, both or neither), so that I choose each time.
4. As the Owner, I want to see exactly what will be posted before anything goes out, so that nothing reaches Threads I haven't seen.
5. As the Owner, I want the Threads post to show a link card to the live Post, so that people can tap through to the site.
6. As the Owner, I want one topic tag on each Threads post, so that it reaches people following that topic.
7. As the Owner, I want each Post shared on Threads at most once, with the post's URL recorded, so that I never double-post by mistake.
8. As the Owner, I want to share an older Post on Threads when I ask for it by name, one at a time, so that my back catalogue reaches Threads without flooding it.
9. As the Owner, I want the Threads token kept alive by the script, so that I don't redo a login every 60 days while I keep posting.
10. As the Owner, I want a warning when the token is close to expiring, so that I'm not surprised by a failed post.
11. As the Owner, I want the one-time Meta setup as a guided script, so that I don't have to work out Meta's dashboards myself and the token never passes through the chat.
12. As the Owner, I want the content check to reject a Threads share that is too long, has more than one topic tag, or has a tag Threads won't accept, so that a post never fails at the API.
13. As a Reader on Threads, I want the post to say what the Post is about in a sentence or two, so that I know whether to tap.

## Implementation Decisions

- **Platforms**: LinkedIn and Threads only. Facebook groups stay manual; X and Instagram are out.
- **Share** becomes the glossary's general term: the text the Owner posts a Post to one platform with, stored next to the Post, posted only when the Owner says so, once per platform, recording the post's URL as a first `posted:` line. **LinkedIn share** and **Threads share** are its two kinds and name only what differs.
- **Threads share** (`threads.txt`): the content module reads it into the Post like the LinkedIn share. Rules: at most 500 characters (counted as characters; verified against the API on the first real post and tightened if Threads counts differently), exactly one topic tag as the text's last line (`#tag`, 1–50 characters, no `.` or `&`), no URL in the text (the link card carries it), and an optional first `posted:` line. `write-post` aims for 300 characters or fewer.
- **Posting**: a TEXT post with the live Post's canonical URL as its link attachment, so Threads draws the card; the topic tag is taken off the text and sent as the API's topic-tag parameter. After publishing, the script fetches the post's permalink and writes it back as the `posted:` line; a post that comes back without a permalink is reported, and the file is left unposted only if publishing itself failed. No "made with AI" label: the site discloses AI help on the About Page.
- **Commands**: one per platform, `pnpm linkedin <slug>` and `pnpm threads <slug>`, each with a preview mode and `--post`. What both share (loading `.env.local`, resolving a Published Post that is live, refusing a file that already has `posted:`, writing the `posted:` line, the token-age warning) moves into one shared helper both scripts use.
- **Token**: `THREADS_ACCESS_TOKEN`, `THREADS_TOKEN_DATE` and the account's user ID in `.env.local`. Each run refreshes a long-lived token that is over 24 hours old and not expired, writing the new token and date back; it warns from ten days before expiry, like LinkedIn. Sixty days without a run lets it expire, and then the wizard is run again.
- **Setup wizard**: generated with `/wizard`: create the Meta app with the Threads use case and the `threads_basic` and `threads_content_publish` permissions, add the Owner as a Threads Tester and accept the invite in Threads, authorise, exchange the code for a long-lived token, and write the token, date and user ID into `.env.local`. No App Review: only the app's own tester posts.
- **`write-post`**: drafts `threads.txt` alongside `linkedin.txt` and shows both to the Owner with the Post. Its last step asks 「要發哪些平台？」 (LinkedIn, Threads, both, neither; nothing preselected), then previews and posts each chosen platform on the Owner's yes. Sharing an older Post on Threads happens one Post at a time, on the Owner's request; there is no batch backfill. A Revision doesn't reshare.

## Testing Decisions

- Tests check behaviour through public interfaces, as `CODING_STANDARDS.md` asks.
- The content module: each `threads.txt` rule has its own fixture under `src/content/fixtures/` that breaks only that rule, as the LinkedIn share's rules do; a valid one is read into the Post.
- Pure helpers (taking the topic tag off the text, deciding whether a token needs refreshing or a warning) get vitest unit tests, like `src/linkedin.test.ts`.
- The API calls are checked by a person: the first real post (proposed: `ai-transition-era`, on the Owner's yes after the preview) shows the card, the topic tag and the recorded URL, and the PR says so. The LinkedIn script, refactored onto the shared helper, is checked by its preview mode on a Post.

## Out of Scope

- Image posts with promo images (they would need public hosting); revisit if the link card looks poor.
- Facebook, X, Instagram.
- Batch sharing of older Posts.
- The "made with AI" label.
- Automatic posting without the Owner's yes.

## Further Notes

- Meta's docs don't say whether the link card uses the page's OG tags, or how Chinese characters count toward 500; the first real post answers both.
