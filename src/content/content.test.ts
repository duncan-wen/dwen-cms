import path from "node:path";
import { describe, expect, it } from "vitest";
import { ContentValidationError, loadContent } from "./content";

const fixture = (name: string) => path.join(import.meta.dirname, "fixtures", name);

describe("loading a valid content directory", () => {
  it("resolves a Published Post by its Slug", async () => {
    const content = await loadContent(fixture("valid"));

    const result = content.resolveSlug("hello-world");

    expect(result.kind).toBe("post");
    if (result.kind !== "post") return;
    expect(result.post).toMatchObject({
      slug: "hello-world",
      title: "你好，世界",
      description: "第一篇文章",
      date: "2026-10-01",
      tags: ["meta"],
    });
    expect(result.post.body).toContain("這是內文。");
  });

  it("answers not-found for an unknown Slug", async () => {
    const content = await loadContent(fixture("valid"));

    expect(content.resolveSlug("no-such-post")).toEqual({ kind: "not-found" });
  });

  it("lists Published Posts newest first", async () => {
    const content = await loadContent(fixture("valid"));

    expect(content.listPublishedPosts().map((post) => post.slug)).toEqual([
      "second-post",
      "hello-world",
    ]);
  });

  it("orders Posts sharing a date by Slug", async () => {
    const content = await loadContent(fixture("same-date"));

    expect(content.listPublishedPosts().map((post) => post.slug)).toEqual([
      "alpha",
      "zulu",
      "older",
    ]);
  });
});

describe("querying by Tag", () => {
  it("lists a Tag's Posts newest first", async () => {
    const content = await loadContent(fixture("valid"));

    expect(content.listPostsByTag("meta").map((post) => post.slug)).toEqual([
      "second-post",
      "hello-world",
    ]);
    expect(content.listPostsByTag("nextjs").map((post) => post.slug)).toEqual(["second-post"]);
  });

  it("lists no Posts for a Tag nobody uses", async () => {
    const content = await loadContent(fixture("valid"));

    expect(content.listPostsByTag("no-such-tag")).toEqual([]);
  });

  it("lists used Tags with their Post counts, most Posts first, then by name", async () => {
    const content = await loadContent(fixture("tag-counts"));

    expect(content.listTagsWithCounts()).toEqual([
      { tag: "nextjs", count: 2 },
      { tag: "ai", count: 1 },
      { tag: "meta", count: 1 },
    ]);
  });
});

describe("validating content", () => {
  it("rejects a Post with a missing required field, naming the file, field and rule", async () => {
    await expect(loadContent(fixture("missing-title"))).rejects.toMatchObject({
      problems: [{ file: "posts/untitled/index.mdx", field: "title", rule: "required" }],
    });
  });

  it.each([
    ["missing-description", "posts/no-description/index.mdx", "description", "required"],
    ["missing-date", "posts/no-date/index.mdx", "date", "required"],
    ["invalid-date", "posts/bad-date/index.mdx", "date", "date-format"],
    ["impossible-date", "posts/month-13/index.mdx", "date", "date-format"],
    ["missing-tags", "posts/no-tags/index.mdx", "tags", "at-least-one-tag"],
    ["empty-tags", "posts/empty-tags/index.mdx", "tags", "at-least-one-tag"],
    ["tags-not-a-list", "posts/string-tags/index.mdx", "tags", "list"],
    ["blank-tag", "posts/blank-tag/index.mdx", "tags", "non-empty-tag"],
    ["duplicate-tag", "posts/twice/index.mdx", "tags", "duplicate-tag"],
  ])("rejects fixture %s: %s %s breaks %s", async (fixtureName, file, field, rule) => {
    await expect(loadContent(fixture(fixtureName))).rejects.toMatchObject({
      problems: [{ file, field, rule }],
    });
  });
});

describe("validating Tags", () => {
  it("rejects a Tag that isn't in the approved Tag list", async () => {
    const error = await loadContent(fixture("unapproved-tag")).catch((e: unknown) => e);

    expect(error).toMatchObject({
      problems: [{ file: "posts/rag-intro/index.mdx", field: "tags", rule: "approved-tag" }],
    });
    expect((error as Error).message).toContain('"rag"');
    expect((error as Error).message).toContain("tags.yml");
  });

  it("rejects a Tag that isn't lowercase, even when its lowercase form is approved", async () => {
    const error = await loadContent(fixture("uppercase-tag")).catch((e: unknown) => e);

    expect(error).toMatchObject({
      problems: [{ file: "posts/rag-intro/index.mdx", field: "tags", rule: "lowercase" }],
    });
    expect((error as Error).message).toContain('"rag"');
  });

  it.each([
    ["missing-tags-file", "file", "required"],
    ["tags-file-broken-yaml", "file", "yaml-syntax"],
    ["tags-file-not-a-list", "tags", "list"],
    ["tags-file-bad-entry", "tags", "kebab-case"],
  ])("rejects an approved Tag list in fixture %s: %s breaks %s", async (fixtureName, field, rule) => {
    await expect(loadContent(fixture(fixtureName))).rejects.toMatchObject({
      problems: [{ file: "tags.yml", field, rule }],
    });
  });
});

describe("validating Post files", () => {
  it("rejects a Post folder without an index.mdx", async () => {
    await expect(loadContent(fixture("missing-index"))).rejects.toMatchObject({
      problems: [{ file: "posts/empty-folder/index.mdx", field: "file", rule: "required" }],
    });
  });

  it("rejects frontmatter that isn't valid YAML", async () => {
    await expect(loadContent(fixture("broken-yaml"))).rejects.toMatchObject({
      problems: [{ file: "posts/broken/index.mdx", field: "frontmatter", rule: "yaml-syntax" }],
    });
  });
});

describe("validating Slugs", () => {
  it("rejects every Slug that isn't lowercase English kebab-case", async () => {
    const error = await loadContent(fixture("bad-slug")).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ContentValidationError);
    const problems = (error as ContentValidationError).problems;
    expect(problems.map((p) => p.file).sort()).toEqual([
      "posts/-leading-dash/index.mdx",
      "posts/Hello_World/index.mdx",
      "posts/你好/index.mdx",
    ]);
    expect(problems.every((p) => p.field === "slug" && p.rule === "kebab-case")).toBe(true);
  });

  it("reports a bad Slug even when the Post's frontmatter is also broken", async () => {
    const error = await loadContent(fixture("bad-slug-and-yaml")).catch((e: unknown) => e);

    expect((error as ContentValidationError).problems.map((p) => p.rule).sort()).toEqual([
      "kebab-case",
      "yaml-syntax",
    ]);
  });
});
