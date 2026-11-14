import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { coverSvg, generateCover } from "./cover";

describe("generateCover", () => {
  it("returns the same contours every time for the same Slug", () => {
    expect(generateCover("why-mdx-in-git")).toEqual(generateCover("why-mdx-in-git"));
  });

  it("gives different Slugs different contours", () => {
    const slugs = ["why-mdx-in-git", "typography-sample", "a", "b", "hello-world"];
    const paths = slugs.map((slug) =>
      generateCover(slug)
        .contours.map((c) => c.d)
        .join(""),
    );
    expect(new Set(paths).size).toBe(slugs.length);
  });

  it("without a phase draws the cover it always has", () => {
    // The SHA-256 of this cover before the phase existed: covers, OG images and promo images must not change.
    const digest = createHash("sha256").update(coverSvg("why-mdx-in-git")).digest("hex");
    expect(digest).toBe("346898ae4509fb8aa5a866e93662d51bbee0ab869ddcf2a737ae45e3654208f0");
  });

  it("moves the same terrain with a phase, the same way every time", () => {
    const paths = (phase?: number) => generateCover("why-mdx-in-git", phase).contours.map((c) => c.d);
    expect(paths(1.5)).toEqual(paths(1.5));
    expect(paths(1.5)).not.toEqual(paths(0));
    expect(paths(1.5)).not.toEqual(paths(1.6));
    expect(paths(1.5)).toHaveLength(22);
  });

  it("draws 22 closed contour lines with every fifth one heavier", () => {
    const { contours } = generateCover("why-mdx-in-git");
    expect(contours).toHaveLength(22);
    expect(contours.every((c) => /^M.*Z$/.test(c.d))).toBe(true);
    expect(contours.flatMap((c, i) => (c.heavy ? [i + 1] : []))).toEqual([5, 10, 15, 20]);
  });
});

describe("coverSvg", () => {
  it("draws every contour of the Slug's cover in one SVG document", () => {
    const svg = coverSvg("why-mdx-in-git");
    expect(svg).toMatch(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
    for (const { d } of generateCover("why-mdx-in-git").contours) expect(svg).toContain(`d="${d}"`);
  });
});
