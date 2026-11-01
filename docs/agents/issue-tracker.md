# Issue tracker: Local Markdown

Issues and specs for this repo live as markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- The spec is `.scratch/<feature-slug>/spec.md`
- Implementation issues are one file per ticket at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`, never a single combined tickets file
- Triage state is recorded as a `**Status:** <role>` line near the top of each issue file and spec, written exactly so (see `triage-labels.md` for the role strings). `grep -rn '^\*\*Status:\*\*' .scratch` lists every ticket's state
- Dependencies are a `**Blocked by:** NN, NN` line
- Comments and conversation history append to the bottom of the file under a `## Comments` heading
- **Shipping**: every branch (a ticket's `issue-<NN>-<slug>`, a retro's `retro-issue-<NN>`) starts off a freshly fetched `origin/main` and opens its PR with `gh pr create --base main`; CI fails a PR whose base is anything else, since a PR merged into another branch never reaches `main`. A ticket's PR body names the branch's preview URL and the paths to check there: open the PR, take the URL from the Vercel bot's comment (`gh pr view <N> --json comments --jq '.comments[].body' | grep -o 'https://[a-z0-9-]*\.vercel\.app'`), then `gh pr edit <N>` it in; Vercel truncates and hashes any `dwen-cms-git-<branch>-duncan-wens-projects` host past 63 characters, so the URL can't be built from the branch name. The Owner reviews that preview and merges. The `Vercel` check in `gh pr checks <N>` passing means the build, and with it the content check, succeeded; previews sit behind Vercel login, so check the listed paths yourself by sending `x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET` (from `.env.local`).
- **Preview env vars**: the Vercel CLI is logged in. Run `vercel link --yes --project dwen-cms` from the scratchpad, never the repo (linking writes `.vercel/` and edits `.gitignore`). A variable scoped with `--git-branch` needs that branch pushed first, and the push's own deployment starts before the variable exists, so `vercel redeploy` it once the variable is added.
- **Done**: when a ticket's work lands, tick every acceptance box it met and set `**Status:** done`, in the same commit as the code. A `Blocked by:` edge clears only when the blocking ticket reads `done` on `main`.

## When a skill says "publish to the issue tracker"

Create a new file under `.scratch/<feature-slug>/` (creating the directory if needed).

## When a skill says "fetch the relevant ticket"

Read the file at the referenced path. The user will normally pass the path or the issue number directly.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a file with one **child** file per ticket.

- **Map**: `.scratch/<effort>/map.md` (the Notes / Decisions-so-far / Fog body).
- **Child ticket**: `.scratch/<effort>/issues/NN-<slug>.md`, numbered from `01`, with the question in the body. A `Type:` line records the ticket type (`research`/`prototype`/`grilling`/`task`); a `Status:` line records `claimed`/`resolved`.
- **Blocking**: a `Blocked by: NN, NN` line near the top. A ticket is unblocked when every file it lists is `resolved`.
- **Frontier**: scan `.scratch/<effort>/issues/` for files that are open, unblocked, and unclaimed; first by number wins.
- **Claim**: set `Status: claimed` and save before any work.
- **Resolve**: append the answer under an `## Answer` heading, set `Status: resolved`, then append a context pointer (gist + link) to the map's Decisions-so-far in `map.md`.
