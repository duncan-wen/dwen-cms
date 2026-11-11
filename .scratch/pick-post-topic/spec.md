# pick-post-topic

**Status:** done

A skill that picks a Topic for the next Post from recent AI news, read from the `ai-news` MCP server, and hands the Owner's choice to `write-post`.

## Decisions

1. **Trigger**: model-invoked. Fires when the Owner asks what to write next, or asks for a new Post without giving a Topic (`write-post` sends that case here).
2. **Search**: only the ai-news `search` tool, never `whats_new`, which moves a Checkpoint every client shares and can't be undone. Default range is the last 7 days, Categories Engineering, Applications and Models. The Owner can give another range or a keyword. A News Item is kept only when it has a technical angle the Owner can build on.
3. **Fit**:
   - a Reader who doesn't code can follow it, in plain words; this ranks first (revised 2026-11-11, after the Owner dropped an eval-experiment Post as too hard for Readers);
   - the Owner can try it hands-on in an afternoon and share what happened: a light try, never an eval suite or a multi-version experiment;
   - its Topic isn't already a Post, or an open Draft;
   - candidates no approved Tag covers rank lower;
   - at most two candidates share a primary Tag.
4. **Verify**: each candidate's Items are read in full (`read_item`); a candidate whose hook or task the full text doesn't back is replaced.
5. **Output**: 3–5 candidates in the conversation only, never saved to a file. Each gives a working title, the hook, what the Owner would do, suggested Tags and the source links. With fewer than 3 fits, show what there is, say what was dropped and why, and offer a wider range or a keyword.
6. **Hand-off**: once the Owner picks, run `write-post` in the same session with the Topic, hook, task and source URLs. The Post's body links its sources.

## Changes

- [x] `.claude/skills/pick-post-topic/SKILL.md`
- [x] `write-post`: a new Post without a Topic runs `pick-post-topic` first; source links a Topic came with are linked in the body
- [x] `GLOSSARY.md`: **Topic** (題材) added; "topic" dropped from Tag's _Avoid_ list
