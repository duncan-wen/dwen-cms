import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkTracker } from "./tracker";

const fixture = (name: string) => path.join(import.meta.dirname, "fixtures", name);

describe("checkTracker", () => {
  it("passes specs and tickets whose Status matches their boxes, and skips wayfinder maps", async () => {
    expect(await checkTracker(fixture("valid"))).toEqual([]);
  });

  it.each([
    ["status-vocabulary", "feature/issues/01-a.md", "Status"],
    ["ticket-ticked-not-done", "feature/issues/01-a.md", "Status"],
    ["ticket-done-open-box", "feature/issues/01-a.md", "boxes"],
    ["owner-ok-noted", "feature/issues/01-a.md", "Comments"],
    ["spec-done-open-ticket", "feature/spec.md", "Status"],
    ["spec-tickets-done", "feature/spec.md", "Status"],
  ])("reports %s at the file and field it names", async (rule, file, field) => {
    const problems = await checkTracker(fixture(rule));

    expect(problems).toContainEqual(expect.objectContaining({ file, field, rule }));
    expect(problems.every((problem) => problem.rule === rule)).toBe(true);
  });

  it("reports a ticket with no Status line", async () => {
    const problems = await checkTracker(fixture("status-vocabulary"));

    expect(problems).toContainEqual(
      expect.objectContaining({ file: "feature/issues/02-b.md", rule: "status-vocabulary" }),
    );
  });
});
