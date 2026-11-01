import { describe, expect, it } from "vitest";
import type { Post } from "./content";
import { groupPostsByYear } from "./posts-by-year";

const post = (slug: string, date: string): Post => ({
  slug,
  title: slug,
  description: "",
  date,
  tags: ["meta"],
  previousSlugs: [],
  latestRevision: undefined,
  cover: undefined,
  images: {},
  promo: { template: "contour", titleLines: [slug], points: [] },
  body: "",
});

describe("grouping Posts by year", () => {
  it("puts each Post under its year, keeping the order given", () => {
    const groups = groupPostsByYear([
      post("newest", "2026-11-01"),
      post("autumn", "2026-01-03"),
      post("last-year", "2025-12-20"),
      post("long-ago", "2023-05-09"),
    ]);

    expect(groups.map(({ year, posts }) => [year, posts.map((p) => p.slug)])).toEqual([
      ["2026", ["newest", "autumn"]],
      ["2025", ["last-year"]],
      ["2023", ["long-ago"]],
    ]);
  });

  it("gives no groups for no Posts", () => {
    expect(groupPostsByYear([])).toEqual([]);
  });
});
