import { describe, expect, it } from "vitest";
import { generateCover } from "./cover";

describe("generateCover", () => {
  it("returns the same contours every time for the same Slug", () => {
    expect(generateCover("why-mdx-in-git")).toEqual(generateCover("why-mdx-in-git"));
  });

  it("gives different Slugs different contours", () => {
    const slugs = ["why-mdx-in-git", "typography-sample", "a", "b", "hello-world"];
    const paths = slugs.map((slug) => generateCover(slug).contours.map((c) => c.d).join(""));
    expect(new Set(paths).size).toBe(slugs.length);
  });

  it("draws 22 closed contour lines with every fifth one heavier", () => {
    const { contours } = generateCover("why-mdx-in-git");
    expect(contours).toHaveLength(22);
    expect(contours.every((c) => /^M.*Z$/.test(c.d))).toBe(true);
    expect(contours.flatMap((c, i) => (c.heavy ? [i + 1] : []))).toEqual([5, 10, 15, 20]);
  });
});
