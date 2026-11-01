# Issue tracker: Local Markdown

Issues and specs for this repo live as markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- The spec is `.scratch/<feature-slug>/spec.md`
- Implementation issues are one file per ticket at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`, never a single combined tickets file
- Triage state is recorded as a `**Status:** <role>` line near the top of each issue file and spec, written exactly so (see `triage-labels.md` for the role strings). `grep -rn '^\*\*Status:\*\*' .scratch` lists every ticket's state
- Dependencies are a `**Blocked by:** NN, NN` line
- **Spec first**: a feature's tickets start only once its spec and ticket files are on `main`. While the spec's PR is open, its tickets wait, so every ticket branch can start off `main` and tick its own file there.
- Comments and conversation history append to the bottom of the file under a `## Comments` heading
- **Shipping**: a spec's tickets ship together on one **integration branch** named `<feature-slug>`, off a freshly fetched `origin/main`. Build each ticket on its own branch `<feature-slug>-<NN>` (in a worktree when several are ready at once) and merge it back into the integration branch once `pnpm check` and `pnpm smoke` pass. After the first merge, open one draft PR with `gh pr create --draft --base main`; CI fails a PR whose base is anything else, since a PR merged into another branch never reaches `main`. When every ticket is done, run `/code-review` against `origin/main` and fix what it finds, then show the Owner the screenshots (see **Visual tickets**), mark the PR ready, and merge it with `gh pr merge --merge` once the Owner says OK and its checks pass. A change outside a spec (a retro, a one-off fix) gets its own branch off `origin/main`, e.g. `retro-<feature-slug>-<NN>`, and its own PR. The `Vercel` check passing means the build, and with it the content check, succeeded. The Vercel preview is optional for the Owner; to check a path on it yourself, take the URL from the Vercel bot's comment (`gh pr view <N> --json comments --jq '.comments[].body' | grep -o 'https://[a-z0-9-]*\.vercel\.app'`) and send `x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET` (from `.env.local`).
- **Preview env vars**: the Vercel CLI is logged in. Run `vercel link --yes --project dwen-cms` from the scratchpad, never the repo (linking writes `.vercel/` and edits `.gitignore`). A variable scoped with `--git-branch` needs that branch pushed first, and the push's own deployment starts before the variable exists, so `vercel redeploy` it once the variable is added.
- **Visual tickets**: before ticking a box about how a page looks, run `pnpm shots <path>…` and read the screenshots. It builds `e2e/content`, shoots each path in light and dark at 1280px and 375px into `test-results/shots/`, writes `test-results/shots/index.html` with every shot on one page, and fails if a page scrolls horizontally at 375px. `/posts/typography-sample` holds every prose element. The Owner reviews from that page: give them `explorer.exe test-results/shots/index.html` to open it.
- **Done**: when a ticket's work lands, tick every acceptance box it met and set `**Status:** done`, in the same commit as the code. A box the Owner checks stays unticked until they say OK; then tick it and note the approval under `## Comments`. A `Blocked by:` edge clears when the blocking ticket reads `done` on the integration branch it ships on, or on `main` for a ticket outside it.

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
