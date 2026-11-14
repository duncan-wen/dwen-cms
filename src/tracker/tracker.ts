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

export type CheckTrackerOptions = {
  /** Keeps a file (relative path, forward slashes) in the check; `pnpm tracker:check` keeps only files git tracks. */
  include?: (file: string) => boolean;
};

/** The Status values a spec or ticket may carry: the triage roles of `docs/agents/triage-labels.md`, plus `done`. */
const STATUSES = ["needs-triage", "needs-info", "ready-for-agent", "ready-for-human", "wontfix", "done"];

/** A spec or ticket that needs no more work. */
const isClosed = (status: string | undefined) => status === "done" || status === "wontfix";

/** A Markdown task-list item at any depth: `- [ ]`, `* [x]`, `+ [X]`. */
const BOX = /^\s*[-*+] \[([ xX])\] (.*)$/gm;

type Doc = { file: string; status: string | undefined };

/**
 * Checks every feature directory under `scratchDir` (`.scratch/`): its `spec.md` and its
 * `issues/*.md` tickets. A wayfinder effort (a directory with `map.md`) keeps its own
 * `Status:` vocabulary and is skipped.
 */
export async function checkTracker(scratchDir: string, { include = () => true }: CheckTrackerOptions = {}) {
  const problems: TrackerProblem[] = [];
  for (const feature of await subdirectories(scratchDir)) {
    const dir = path.join(scratchDir, feature);
    const files = await readdir(dir);
    if (files.includes("map.md")) continue;

    const tickets: Doc[] = [];
    for (const name of (await listOrEmpty(path.join(dir, "issues"))).sort()) {
      const file = `${feature}/issues/${name}`;
      if (!name.endsWith(".md") || !include(file)) continue;
      tickets.push({ file, status: checkDoc(file, await readText(path.join(dir, "issues", name)), problems) });
    }

    const file = `${feature}/spec.md`;
    if (!files.includes("spec.md") || !include(file)) continue;
    const status = checkDoc(file, await readText(path.join(dir, "spec.md")), problems);
    // A ticket with no valid Status is already reported; the spec's rules count only the rest.
    const known = tickets.filter((ticket) => ticket.status !== undefined);
    const open = known.filter((ticket) => !isClosed(ticket.status));
    if (status === "done" && open.length > 0) {
      problems.push({
        file,
        field: "Status",
        rule: "spec-done-open-ticket",
        message: `the spec is done, but ${open.map((ticket) => ticket.file).join(", ")} is not: finish the ticket, or set the spec back`,
      });
    }
    if (
      known.length > 0 &&
      known.length === tickets.length &&
      open.length === 0 &&
      !isClosed(status) &&
      status !== undefined
    ) {
      problems.push({
        file,
        field: "Status",
        rule: "spec-tickets-done",
        message:
          "every ticket is closed, so the spec is too: set **Status:** done (or wontfix), or add a ticket for the work still to come",
      });
    }
  }
  return problems;
}

/** Checks a spec's or ticket's Status against its boxes and returns the Status, undefined when it has none valid. */
function checkDoc(file: string, text: string, problems: TrackerProblem[]): string | undefined {
  const status = readStatus(file, text, problems);
  const boxes = [...text.matchAll(BOX)].map(([, mark, label]) => ({ ticked: mark !== " ", label }));
  const open = boxes.filter((box) => !box.ticked);

  if (boxes.length > 0 && open.length === 0 && status !== undefined && !isClosed(status)) {
    problems.push({
      file,
      field: "Status",
      rule: "ticked-not-done",
      message: "every box is ticked, so it is done: set **Status:** done in the commit that ticks the last box",
    });
  }
  if (status === "done" && open.length > 0) {
    problems.push({
      file,
      field: "boxes",
      rule: "done-open-box",
      message: `it is done, but ${open.length} box(es) are not ticked: tick each one met, and move the rest to another ticket or explain under ## Comments and tick`,
    });
  }
  const comments = text.split(/^## Comments$/m)[1] ?? "";
  const noted = comments.split("\n").some((line) => /\bOwner\b/.test(line) && /\bOK\b/.test(line));
  if (boxes.some((box) => box.ticked && /said OK/.test(box.label)) && !noted) {
    problems.push({
      file,
      field: "Comments",
      rule: "owner-ok-noted",
      message:
        "a box says the Owner said OK: note under ## Comments when they said it (a line naming the Owner and OK)",
    });
  }
  return status;
}

function readStatus(file: string, text: string, problems: TrackerProblem[]): string | undefined {
  const status = /^\*\*Status:\*\* *(\S+)/m.exec(text)?.[1];
  if (status !== undefined && STATUSES.includes(status)) return status;
  problems.push({
    file,
    field: "Status",
    rule: "status-vocabulary",
    message: `needs a **Status:** line, one of ${STATUSES.join(", ")}${status === undefined ? "" : `; got "${status}"`}`,
  });
  return undefined;
}

/** A file's text with Windows line endings read as `\n`, so line anchors work on a file saved from Windows. */
async function readText(file: string) {
  return (await readFile(file, "utf8")).replace(/\r\n/g, "\n");
}

/** A directory's entries, or none when it doesn't exist; any other error is thrown. */
async function listOrEmpty(dir: string): Promise<string[]> {
  try {
    return await readdir(dir);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function subdirectories(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}
