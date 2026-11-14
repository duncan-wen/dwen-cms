# Shares

A Share is a text next to `index.mdx`, one per platform, posted with a link card the platform draws for the live Post. Both open on the Post's hook in the Owner's voice and carry no URL: the card carries it.

**`linkedin.txt`** is the more formal one: the hook in the first line (LinkedIn folds the rest behind 「…更多」), then two to five lines or a short `・` list of what the Reader gets, then a closing reframe. End with two or three hashtags, from the Post's Tags (`#Python`) plus at most one topic word (`#asyncio`); the content check fails a fourth, and anything past LinkedIn's 3,000 characters. Write the hashtags in plain `#tag` form: `pnpm linkedin` converts the text to LinkedIn's format.

**`threads.txt`** is casual and short, aiming for 300 characters (the content check stops at 500): the hook, a line or two of what happened, what the Post covers in one sentence, then the closing reframe, each its own short paragraph. Its last line is one topic tag alone, `#AI` or the Post's main Tag, with no `.` or `&` (`#Nextjs`, not `#Next.js`); the content check fails a second tag anywhere in the text.

To share, for each platform the Owner said yes to (`linkedin` or `threads` as `<platform>`):

1. `pnpm <platform> <slug>` shows what would be posted, from the live page. Show the Owner the text and the link before posting; a text the Owner already read in the Post's merged PR body, unchanged since, counts as shown.
2. `pnpm <platform> <slug> --post` posts it publicly and writes the post's URL into the Share as a first `posted:` line. The script refuses a Share that already has one, so each platform gets a Post once. A Revision doesn't reshare the Post; only the Owner asking does, with a new text.
3. Commit the `posted:` lines on a branch `share-<slug>` off `origin/main`, open a PR, and merge it yourself once its checks pass: it only records the shares. Send the Owner each post's URL.

**Threads token**: `pnpm threads` refreshes its own token on each run after the first day and warns ten days before it expires. It expires only after 60 days without a run; then ask the Owner to run `bash scripts/threads-setup.sh` in their own terminal, which writes a new one into `.env.local`.

**LinkedIn token**: the script reads `LINKEDIN_ACCESS_TOKEN` and `LINKEDIN_TOKEN_DATE` from `.env.local`. A token lasts 60 days; the script warns ten days ahead and fails with a 401 once it's expired. Then have the Owner open https://www.linkedin.com/developers/tools/oauth/token-generator, pick the app, tick `openid`, `profile` and `w_member_social`, and paste the new token into `.env.local` themselves (never into the chat), with today's date as `LINKEDIN_TOKEN_DATE`.
