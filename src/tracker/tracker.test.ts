import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkTracker } from "./tracker";

const fixture = (name: string) => path.join(import.meta.dirname, "fixtures", name);

describe("checkTracker", () => {
  it("passes specs and tickets whose Status matches their boxes, and skips wayfinder maps", async () => {
    expect(await checkTracker(fixture("valid"), { include: (file) => !file.startsWith("draft/") })).toEqual([]);
  });

  it.each([
    ["status-vocabulary", "feature/issues/01-a.md", "Status"],
    ["ticked-not-done", "feature/issues/01-a.md", "Status"],
    ["ticked-not-done", "feature/issues/02-b.md", "Status"],
    ["ticked-not-done", "feature/spec.md", "Status"],
    ["done-open-box", "feature/issues/01-a.md", "boxes"],
    ["done-open-box", "feature/issues/02-b.md", "boxes"],
    ["owner-ok-noted", "feature/issues/01-a.md", "Comments"],
    ["owner-ok-noted", "feature/issues/02-b.md", "Comments"],
    ["spec-done-open-ticket", "feature/spec.md", "Status"],
    ["spec-tickets-done", "feature/spec.md", "Status"],
  ])("reports %s at the file and field it names", async (rule, file, field) => {
    const problems = await checkTracker(fixture(rule));

    expect(problems).toContainEqual(expect.objectContaining({ file, field, rule }));
    expect(problems.every((problem) => problem.rule === rule)).toBe(true);
  });

  it("reads only the files `include` keeps", async () => {
    const problems = await checkTracker(fixture("valid"));

    expect(problems).toContainEqual(
      expect.objectContaining({ file: "draft/issues/01-a.md", rule: "status-vocabulary" }),
    );
  });

  it("reads a file saved with Windows line endings", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "tracker-"));
    try {
      await mkdir(path.join(dir, "feature", "issues"), { recursive: true });
      const ticket = [
        "# Ticket",
        "",
        "**Status:** done",
        "",
        "- [x] The Owner has seen the screenshots and said OK",
        "",
        "## Comments",
        "",
        "- 2026-11-14: the Owner said OK.",
        "",
      ].join("\r\n");
      await writeFile(path.join(dir, "feature", "issues", "01-a.md"), ticket);

      expect(await checkTracker(dir)).toEqual([]);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("reports a ticket with no Status line", async () => {
    const problems = await checkTracker(fixture("status-vocabulary"));

    expect(problems).toContainEqual(
      expect.objectContaining({ file: "feature/issues/02-b.md", rule: "status-vocabulary" }),
    );
  });
});
