# Issue tracker: Local Markdown

Issues and specs for this repo live as markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- The spec is `.scratch/<feature-slug>/spec.md`
- Implementation issues are one file per ticket at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`, never a single combined tickets file
- Triage state is recorded as a `**Status:** <role>` line near the top of each issue file and spec, written exactly so (see `triage-labels.md` for the role strings). `grep -rn '^\*\*Status:\*\*' .scratch` lists every ticket's state
- Dependencies are a `**Blocked by:** NN, NN` line
- **Spec first**: a feature's tickets start only once its spec and ticket files are on `main`. While the spec's PR is open, its tickets wait, so every ticket branch can start off `main` and tick its own file there. A feature first asked for in chat starts the same way: run `/grilling`, write the agreed decisions to `.scratch/<feature-slug>/spec.md`, then write code. A fact the spec states about the code as it is now (a page the site has, a component that exists) is checked in the code before it's written in. For a visual change, the first question is the job it does for readers (introduce the Owner, show technical skill, help them find Posts); offer looks only once that's agreed.
- Comments and conversation history append to the bottom of the file under a `## Comments` heading
- **Shipping**: a ticket reaches `main` as `shipping.md` describes.
- **Prototypes**: a prototype lives on its own `prototype/<name>` branch, kept after the work ships: tickets cite it as a primary source.
- **Done**: when a ticket's work lands, tick every acceptance box it met and set `**Status:** done`, in the same commit as the code. A box the Owner checks stays unticked until they say OK; then tick it and note the approval under `## Comments`. A `Blocked by:` edge clears when the blocking ticket reads `done` on the integration branch it ships on, or on `main` for a ticket outside it. The PR that lands a spec's last open ticket also sets the spec's own `**Status:**` to `done`. `pnpm tracker:check` (in `pnpm check`) fails a spec or ticket whose Status disagrees with its boxes or tickets.

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
