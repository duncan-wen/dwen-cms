import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

/** A spec or ticket whose Status disagrees with its boxes or its tickets (`docs/agents/issue-tracker.md`, **Done**). */
export type TrackerProblem = {
  /** Path relative to the tracker directory, with forward slashes. */
  file: string;
  field: "Status" | "boxes" | "Comments";
  rule: string;
  message: string;
};

/** The Status values a spec or ticket may carry: the triage roles of `docs/agents/triage-labels.md`, plus `done`. */
const STATUSES = ["needs-triage", "needs-info", "ready-for-agent", "ready-for-human", "wontfix", "done"];

/** A ticket that needs no more work. */
const isClosed = (status: string | undefined) => status === "done" || status === "wontfix";

type Ticket = { file: string; status: string | undefined };

/**
 * Checks every feature directory under `scratchDir` (`.scratch/`): its `spec.md` and its
 * `issues/*.md` tickets. A wayfinder effort (a directory with `map.md`) keeps its own
 * `Status:` vocabulary and is skipped.
 */
export async function checkTracker(scratchDir: string): Promise<TrackerProblem[]> {
  const problems: TrackerProblem[] = [];
  for (const feature of await subdirectories(scratchDir)) {
    const dir = path.join(scratchDir, feature);
    const files = await readdir(dir);
    if (files.includes("map.md")) continue;

    const tickets: Ticket[] = [];
    for (const name of (await readdir(path.join(dir, "issues")).catch(() => [])).sort()) {
      if (!name.endsWith(".md")) continue;
      const file = `${feature}/issues/${name}`;
      const text = await readFile(path.join(dir, "issues", name), "utf8");
      tickets.push({ file, status: checkTicket(file, text, problems) });
    }

    if (!files.includes("spec.md")) continue;
    const file = `${feature}/spec.md`;
    const status = readStatus(file, await readFile(path.join(dir, "spec.md"), "utf8"), problems);
    const open = tickets.filter((ticket) => !isClosed(ticket.status));
    if (status === "done" && open.length > 0) {
      problems.push({
        file,
        field: "Status",
        rule: "spec-done-open-ticket",
        message: `the spec is done, but ${open.map((ticket) => ticket.file).join(", ")} is not: finish the ticket, or set the spec back`,
      });
    }
    if (tickets.length > 0 && open.length === 0 && status !== "done" && status !== "wontfix") {
      problems.push({
        file,
        field: "Status",
        rule: "spec-tickets-done",
        message: `every ticket is done, so the spec is too: set **Status:** done, or add a ticket for the work still to come`,
      });
    }
  }
  return problems;
}

/** Checks a ticket's Status against its boxes and returns the Status. */
function checkTicket(file: string, text: string, problems: TrackerProblem[]): string | undefined {
  const status = readStatus(file, text, problems);
  const ticked = text.match(/^- \[x\] .*$/gm) ?? [];
  const open = text.match(/^- \[ \] .*$/gm) ?? [];

  if (ticked.length > 0 && open.length === 0 && !isClosed(status) && status !== undefined) {
    problems.push({
      file,
      field: "Status",
      rule: "ticket-ticked-not-done",
      message: "every box is ticked, so the ticket is done: set **Status:** done in the commit that ticks the last box",
    });
  }
  if (status === "done" && open.length > 0) {
    problems.push({
      file,
      field: "boxes",
      rule: "ticket-done-open-box",
      message: `the ticket is done, but ${open.length} box(es) are not ticked: tick each one met, and move the rest to another ticket or explain under ## Comments then tick`,
    });
  }
  const comments = text.split(/^## Comments$/m)[1] ?? "";
  if (ticked.some((box) => /said OK/.test(box)) && !/\bOK\b/.test(comments)) {
    problems.push({
      file,
      field: "Comments",
      rule: "owner-ok-noted",
      message: "a box says the Owner said OK: note under ## Comments when they said it",
    });
  }
  return status;
}

function readStatus(file: string, text: string, problems: TrackerProblem[]): string | undefined {
  const status = /^\*\*Status:\*\* *(\S+)/m.exec(text)?.[1];
  if (status === undefined || !STATUSES.includes(status)) {
    problems.push({
      file,
      field: "Status",
      rule: "status-vocabulary",
      message: `needs a **Status:** line, one of ${STATUSES.join(", ")}${status === undefined ? "" : `; got "${status}"`}`,
    });
    return undefined;
  }
  return status;
}

async function subdirectories(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}
