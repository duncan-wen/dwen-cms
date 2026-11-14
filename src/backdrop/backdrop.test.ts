import { describe, expect, it } from "vitest";
import { generateCover } from "@/cover/cover";
import { backdropLines, backdropSeed } from "./backdrop";

describe("backdropSeed", () => {
  it("seeds a Post's Backdrop with its Slug", () => {
    expect(backdropSeed("/posts/why-mdx-in-git")).toBe("why-mdx-in-git");
    expect(backdropSeed("/posts/why-mdx-in-git/opengraph-image")).toBe("why-mdx-in-git");
  });

  it("gives every other page the same seed", () => {
    const pages = ["/", "/posts", "/tags", "/tags/meta", "/series/concurrency", "/about", "/no-such-page"];
    expect(new Set(pages.map(backdropSeed)).size).toBe(1);
    expect(backdropSeed("/")).not.toBe(backdropSeed("/posts/why-mdx-in-git"));
  });
});

describe("backdropLines", () => {
  it("draws nothing when the Backdrop is off", () => {
    expect(backdropLines("off", "why-mdx-in-git", 0)).toBeNull();
  });

  it("draws the seed's cover terrain at the phase, at any other strength", () => {
    for (const strength of ["faint", "medium", "accent"] as const) {
      expect(backdropLines(strength, "why-mdx-in-git", 2)).toEqual(generateCover("why-mdx-in-git", 2));
    }
  });
});
