---
name: pick-post-topic
description: Pick a Topic for the next Post from recent AI news. Use when asked what to write next, or asked for a new Post without a Topic.
---

# pick-post-topic

You turn recent AI news into a shortlist of Topics the Owner could write next, then hand the one they pick to `write-post`. Terms (Topic, Post, Tag, Draft, Owner) are `GLOSSARY.md`'s.

The news is in the `ai-news` MCP server. Read it with `search` and `read_item` only: `whats_new` marks Items seen for every client that shares the server, and that can't be undone.

## Steps

1. **List what's covered.** Read the `title`, `description` and `tags` of every `content/posts/*/index.mdx`, and the open Drafts: `gh pr list --state open --search "head:post-" --json title,headRefName`. Done when you can name every Topic already written or in a Draft.
2. **Search.** Call `search` with `since` 7 days before today, `categories: ["Engineering", "Applications", "Models"]` and `limit: 100`; then once more with `categories: ["News"]`, keeping only a News Item that has a technical angle (a model, API or tool the Owner can try). When the Owner gave a range or a keyword, use it as `since`/`until` or `query` instead. A week often holds more than 100 Items: whenever a call returns exactly `limit` Items, call again with `until` set to the oldest returned `published_at`. Done when every call has come back short of `limit` and you've read every returned title and summary.
3. **Shortlist.** Group Items about the same subject into one candidate Topic. A candidate **fits** when:
   - a Reader who doesn't code can follow it: its finding and why it matters fit in plain words, with no code, table or experiment needed to understand it. This ranks above every other condition;
   - the Owner can try it hands-on in an afternoon and share what happened (use a new tool, compare two models' answers to one question, try a prompt), beyond retelling the news; a light try, never an eval suite or a multi-version experiment;
   - no Post or Draft from step 1 covers it;
   - an approved Tag in `content/tags.yml` covers it; a candidate that would need a new Tag ranks below every one that doesn't;
   - at most two candidates share a primary Tag.

   Done when you hold up to five fits, best first.
4. **Verify.** `read_item` every Item behind each candidate. Keep a candidate only when the full text backs its hook and shows the thing the Owner would use is available now (released, with a public API, open weights or a download). Replace a dropped candidate with the next fit and verify it too. Done when every candidate you will show rests on text you read in full.
5. **Present** the candidates in the conversation, in Traditional Chinese, numbered, each with:
   - 暫定標題, written by `write-post`'s **Title** rule;
   - hook: the surprising finding or concrete result the Post would lead with;
   - 要動手做什麼: what the Owner builds, tries or measures;
   - 建議 Tag, from `content/tags.yml` (mark a new one 「新 Tag」);
   - 來源: each Item's title and URL.

   With fewer than three fits, show those you have, list the Items you dropped with the reason for each, and offer a wider range or a keyword.
6. **Hand off.** When the Owner picks one, invoke `write-post` with its Topic, hook, task and source URLs. Done when `write-post` has started.
