import { describe, expect, it } from "vitest";
import { shouldSkipBuild } from "./ignore-build";

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
