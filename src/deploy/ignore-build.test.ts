import { describe, expect, it } from "vitest";
import { changedFiles, shouldSkipBuild } from "./ignore-build";

describe("shouldSkipBuild", () => {
  it("skips a push that only changes specs, docs, skills and the root's Markdown", () => {
    expect(
      shouldSkipBuild([
        ".scratch/x/spec.md",
        "docs/agents/shipping.md",
        ".claude/skills/write-post/SKILL.md",
        "CODING_STANDARDS.md",
      ]),
    ).toBe(true);
  });

  it.each([
    ["a source file", ["docs/a.md", "src/app/page.tsx"]],
    ["a Post", ["content/posts/x/index.mdx"]],
    ["Markdown below the root", ["content/pages/about/index.mdx", "e2e/README.md"]],
    ["the deploy config itself", ["vercel.json"]],
  ])("builds when a push changes %s", (_, paths) => {
    expect(shouldSkipBuild(paths)).toBe(false);
  });

  it("builds when it can't tell what changed", () => {
    expect(shouldSkipBuild([])).toBe(false);
  });
});

describe("changedFiles", () => {
  it("lists what changed since the branch's last deployment", () => {
    expect(changedFiles("abc", (since) => (since === "abc" ? "docs/a.md\nsrc/b.ts\n" : ""))).toEqual([
      "docs/a.md",
      "src/b.ts",
    ]);
  });

  it("lists nothing, so the build runs, on a branch's first deployment", () => {
    expect(changedFiles(undefined, () => "docs/a.md\n")).toEqual([]);
    expect(changedFiles("", () => "docs/a.md\n")).toEqual([]);
  });

  it("lists nothing, so the build runs, when git can't diff", () => {
    expect(
      changedFiles("abc", () => {
        throw new Error("unknown revision");
      }),
    ).toEqual([]);
  });
});
