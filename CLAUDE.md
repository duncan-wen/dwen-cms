# dwen-cms

## Agent skills

### Issue tracker

A new feature, even one asked for in chat, starts with `/grilling` and a spec before any code: `docs/agents/issue-tracker.md`. Issues and specs live as local markdown files under `.scratch/<feature>/`.

### Shipping

Any change bound for a PR, from a spec or one-off, and any visual change shown to the Owner: `docs/agents/shipping.md` (branches, `/code-review`, screenshots with `pnpm shots <path>`, merging, the production check, Vercel preview env vars).

### Triage labels

Default vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), recorded as a `Status:` line in each issue file. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
