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

  it("redirects every previous Slug to the Post's current Slug", async () => {
    const content = await loadContent(fixture("previous-slugs"));

    expect(content.resolveSlug("old-name")).toEqual({ kind: "redirect", to: "renamed-post" });
    expect(content.resolveSlug("older-name")).toEqual({ kind: "redirect", to: "renamed-post" });
    expect(content.resolveSlug("renamed-post").kind).toBe("post");
  });

  it("answers with a Takedown marker for a taken-down Slug", async () => {
    const content = await loadContent(fixture("taken-down"));

    expect(content.resolveSlug("removed-post")).toEqual({ kind: "taken-down" });
    expect(content.resolveSlug("kept-post").kind).toBe("post");
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

describe("images", () => {
  it("gives a Post every image its body references, keyed by the reference, with its dimensions", async () => {
    const content = await loadContent(fixture("images"));

    const result = content.resolveSlug("with-images");

    expect(result.kind === "post" && result.post.images).toEqual({
      "./diagram.png": { file: "diagram.png", width: 12, height: 8 },
      "diagram.png": { file: "diagram.png", width: 12, height: 8 },
    });
  });

  it("gives a Post its cover image from frontmatter, with its dimensions", async () => {
    const content = await loadContent(fixture("images"));

    const result = content.resolveSlug("with-images");

    expect(result.kind === "post" && result.post.cover).toEqual({
      file: "cover.png",
      width: 21,
      height: 9,
    });
  });

  it("gives a Post without images no cover and no images", async () => {
    const content = await loadContent(fixture("images"));

    const result = content.resolveSlug("no-images");

    expect(result.kind === "post" && result.post).toMatchObject({ cover: undefined, images: {} });
  });

  it("lists every image a Post uses, its cover first, each file once", async () => {
    const content = await loadContent(fixture("images"));

    expect(content.listPostImages("with-images").map((image) => image.file)).toEqual([
      "cover.png",
      "diagram.png",
    ]);
    expect(content.listPostImages("no-images")).toEqual([]);
    expect(content.listPostImages("no-such-post")).toEqual([]);
  });

  it("reads a Post's image file with its media type, and nothing for a file the Post doesn't use", async () => {
    const content = await loadContent(fixture("images"));

    const image = await content.readPostImage("with-images", "diagram.png");

    expect(image?.type).toBe("image/png");
    expect(Buffer.from(image?.bytes ?? []).subarray(1, 4).toString()).toBe("PNG");
    expect(await content.readPostImage("with-images", "index.mdx")).toBeUndefined();
    expect(await content.readPostImage("no-images", "diagram.png")).toBeUndefined();
  });

  it("gives an Illustration its viewBox size, its SVG source and the narrowest it may be drawn", async () => {
    const content = await loadContent(fixture("images"));

    const result = content.resolveSlug("with-illustration");
    const image = result.kind === "post" ? result.post.images["./boxes.svg"] : undefined;

    expect(image).toMatchObject({ file: "boxes.svg", width: 320, height: 120 });
    expect(image?.illustration).toMatchObject({ width: 320, height: 120, minWidth: 160 });
    expect(image?.illustration?.svg).toContain('fill="var(--series-1)"');
  });

  it("gives an Illustration too wide for a phone its phone copy", async () => {
    const content = await loadContent(fixture("images"));

    const result = content.resolveSlug("with-illustration");
    const image = result.kind === "post" ? result.post.images["./timeline.svg"] : undefined;

    expect(image?.illustration).toMatchObject({ width: 640, phone: { width: 300, height: 120 } });
    expect(image?.illustration?.phone?.svg).toContain("直的時間軸");
  });

  it("reads an Illustration as SVG", async () => {
    const content = await loadContent(fixture("images"));

    const image = await content.readPostImage("with-illustration", "boxes.svg");

    expect(image?.type).toBe("image/svg+xml");
  });

  it.each([
    ["illustration-syntax", "broken", "well-formed SVG"],
    ["illustration-viewbox", "no-viewbox", "viewBox"],
    ["illustration-unsafe", "scripted", "<script>"],
    ["illustration-colour", "hex-colour", 'fill="red"'],
    ["illustration-font", "own-font", 'font-family="Arial"'],
    ["illustration-text-size", "tiny-text", "10px"],
    ["illustration-phone", "too-wide", '"./drawing.phone.svg"'],
  ])("rejects an Illustration breaking %s, naming the file and %s", async (rule, slug, named) => {
    const error = await loadContent(fixture(rule)).catch((e: unknown) => e);

    expect(error).toMatchObject({ problems: [{ file: `posts/${slug}/index.mdx`, field: "body", rule }] });
    expect((error as Error).message).toContain('"./drawing.svg"');
    expect((error as Error).message).toContain(named);
  });

  it.each([
    ["missing-body-image", "posts/no-such-image/index.mdx", "body", "image-exists", '"./missing.png"'],
    ["linked-body-image", "posts/linked-image/index.mdx", "body", "image-not-linked", '"./flow.png"'],
    ["jsx-linked-body-image", "posts/jsx-linked-image/index.mdx", "body", "image-not-linked", '"./flow.png"'],
    ["missing-cover", "posts/no-such-cover/index.mdx", "cover", "image-exists", '"missing.png"'],
    ["image-outside-post", "posts/remote-image/index.mdx", "body", "image-exists", '"https://example.com/a.png"'],
    ["unsupported-image", "posts/not-really-png/index.mdx", "body", "image-format", '"./fake.png"'],
    ["cover-not-a-string", "posts/bad-cover/index.mdx", "cover", "image-path", "cover.jpg"],
  ])("rejects fixture %s: %s %s breaks %s, naming %s", async (fixtureName, file, field, rule, named) => {
    const error = await loadContent(fixture(fixtureName)).catch((e: unknown) => e);

    expect(error).toMatchObject({ problems: [{ file, field, rule }] });
    expect((error as Error).message).toContain(named);
  });

  it("rejects a body that isn't valid MDX", async () => {
    await expect(loadContent(fixture("mdx-syntax"))).rejects.toMatchObject({
      problems: [{ file: "posts/broken-mdx/index.mdx", field: "body", rule: "mdx-syntax" }],
    });
  });

  it("rejects Mermaid that doesn't parse, naming the block by its position and line", async () => {
    const error = await loadContent(fixture("mermaid-syntax")).catch((e: unknown) => e);

    expect(error).toMatchObject({
      problems: [{ file: "posts/broken-diagram/index.mdx", field: "body", rule: "mermaid-syntax" }],
    });
    expect((error as Error).message).toContain("Mermaid block 2 (line 15)");
  });

  it("rejects a Mermaid diagram type the site can't draw, naming the block", async () => {
    const error = await loadContent(fixture("mermaid-unsupported")).catch((e: unknown) => e);

    expect(error).toMatchObject({
      problems: [
        { file: "posts/unsupported-diagram/index.mdx", field: "body", rule: "mermaid-diagram-type" },
      ],
    });
    expect((error as Error).message).toContain("Mermaid block 1 (line 8)");
  });

  it("rejects Mermaid that parses but the site's renderer can't draw, naming the block", async () => {
    const error = await loadContent(fixture("mermaid-render")).catch((e: unknown) => e);

    expect(error).toMatchObject({
      problems: [{ file: "posts/undrawable-diagram/index.mdx", field: "body", rule: "mermaid-render" }],
    });
    expect((error as Error).message).toContain("Mermaid block 1 (line 8)");
  });

  it("rejects a diagram too wide for a phone's column, naming the block and the width it needs", async () => {
    const error = await loadContent(fixture("mermaid-phone-width")).catch((e: unknown) => e);

    expect(error).toMatchObject({
      problems: [{ file: "posts/wide-diagram/index.mdx", field: "body", rule: "mermaid-phone-width" }],
    });
    expect((error as Error).message).toMatch(/Mermaid block 1 \(line 8\) needs \d+px/);
  });

  it("rejects a flowchart node ID that isn't ASCII, advising ASCII IDs with Chinese labels", async () => {
    const error = await loadContent(fixture("mermaid-ascii-id")).catch((e: unknown) => e);

    expect(error).toMatchObject({
      problems: [{ file: "posts/chinese-ids/index.mdx", field: "body", rule: "mermaid-ascii-id" }],
    });
    expect((error as Error).message).toContain("Mermaid block 1 (line 8)");
    expect((error as Error).message).toContain('"審閱"');
    expect((error as Error).message).toContain("review{審閱}");
  });
});

describe("Revisions", () => {
  it("gives a Post its latest Revision by date", async () => {
    const content = await loadContent(fixture("revisions"));

    const result = content.resolveSlug("revised");

    expect(result.kind === "post" && result.post.latestRevision).toEqual({
      date: "2026-10-20",
      note: "補上效能比較",
    });
  });

  it("gives a Post without Revisions no latest Revision", async () => {
    const content = await loadContent(fixture("revisions"));

    const result = content.resolveSlug("corrected");

    expect(result.kind === "post" && result.post.latestRevision).toBeUndefined();
  });

  it("accepts a Revision dated the same day as the Post", async () => {
    const content = await loadContent(fixture("revisions"));

    const result = content.resolveSlug("same-day");

    expect(result.kind === "post" && result.post.latestRevision).toEqual({
      date: "2026-10-01",
      note: "發布當天補上範例",
    });
  });

  it("rejects a Revision dated before the Post, naming both dates", async () => {
    const error = await loadContent(fixture("revision-before-post")).catch((e: unknown) => e);

    expect(error).toMatchObject({
      problems: [
        { file: "posts/time-travel/index.mdx", field: "revisions", rule: "revision-on-or-after-post" },
      ],
    });
    expect((error as Error).message).toContain("2026-09-30");
    expect((error as Error).message).toContain("2026-10-01");
  });

  it.each([
    ["revisions-not-a-list", "posts/single-revision/index.mdx", "list"],
    ["revision-bad-date", "posts/bad-revision-date/index.mdx", "date-format"],
    ["revision-missing-note", "posts/silent-revision/index.mdx", "required"],
  ])("rejects Revisions in fixture %s: %s breaks %s", async (fixtureName, file, rule) => {
    await expect(loadContent(fixture(fixtureName))).rejects.toMatchObject({
      problems: [{ file, field: "revisions", rule }],
    });
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

describe("Pages", () => {
  it("gets a Page by its name", async () => {
    const content = await loadContent(fixture("pages"));

    expect(content.getPage("about")).toMatchObject({
      name: "about",
      title: "關於",
      description: "認識站主",
    });
    expect(content.getPage("about")?.body).toContain("這是關於頁的內文。");
  });

  it("gets nothing for an unknown Page name", async () => {
    const content = await loadContent(fixture("pages"));

    expect(content.getPage("no-such-page")).toBeUndefined();
  });

  it("lists every Page in name order", async () => {
    const content = await loadContent(fixture("pages"));

    expect(content.listPages().map((page) => page.name)).toEqual(["about", "uses"]);
  });

  it("keeps Pages out of the Post list", async () => {
    const content = await loadContent(fixture("pages"));

    expect(content.listPublishedPosts().map((post) => post.slug)).toEqual(["a-post"]);
    expect(content.resolveSlug("about")).toEqual({ kind: "not-found" });
  });

  it.each([
    ["page-missing-title", "pages/about/index.mdx", "title", "required"],
    ["page-missing-description", "pages/about/index.mdx", "description", "required"],
    ["page-missing-index", "pages/about/index.mdx", "file", "required"],
    ["page-bad-name", "pages/About_Me/index.mdx", "name", "kebab-case"],
  ])("rejects fixture %s: %s %s breaks %s", async (fixtureName, file, field, rule) => {
    await expect(loadContent(fixture(fixtureName))).rejects.toMatchObject({
      problems: [{ file, field, rule }],
    });
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

  it("rejects previous Slugs that aren't a list", async () => {
    await expect(loadContent(fixture("previous-slugs-not-a-list"))).rejects.toMatchObject({
      problems: [{ file: "posts/renamed/index.mdx", field: "previousSlugs", rule: "list" }],
    });
  });

  it("rejects a previous Slug that isn't lowercase English kebab-case", async () => {
    const error = await loadContent(fixture("previous-slug-bad-case")).catch((e: unknown) => e);

    expect(error).toMatchObject({
      problems: [{ file: "posts/renamed/index.mdx", field: "previousSlugs", rule: "kebab-case" }],
    });
    expect((error as Error).message).toContain('"Old_Name"');
  });

  it("rejects a previous Slug that is another Post's current Slug", async () => {
    const error = await loadContent(fixture("previous-slug-is-current")).catch((e: unknown) => e);

    expect(error).toMatchObject({
      problems: [
        {
          file: "posts/renamed/index.mdx",
          field: "previousSlugs",
          rule: "previous-slug-is-current",
        },
      ],
    });
    expect((error as Error).message).toContain("posts/other-post/index.mdx");
  });

  it("rejects a previous Slug that two Posts claim, naming both", async () => {
    const error = await loadContent(fixture("previous-slug-claimed-twice")).catch(
      (e: unknown) => e,
    );

    expect(error).toMatchObject({
      problems: [
        {
          file: "posts/second/index.mdx",
          field: "previousSlugs",
          rule: "previous-slug-claimed-twice",
        },
      ],
    });
    expect((error as Error).message).toContain('"shared-name"');
    expect((error as Error).message).toContain("posts/first/index.mdx");
  });

  it.each([
    ["taken-down-slug-is-current", "posts/old-post/index.mdx", "slug"],
    ["taken-down-slug-is-previous", "posts/new-post/index.mdx", "previousSlugs"],
  ])("rejects a taken-down Slug reused in fixture %s: %s %s", async (fixtureName, file, field) => {
    const error = await loadContent(fixture(fixtureName)).catch((e: unknown) => e);

    expect(error).toMatchObject({ problems: [{ file, field, rule: "taken-down-slug" }] });
    expect((error as Error).message).toContain('"old-post"');
    expect((error as Error).message).toContain("taken-down.yml");
  });

  it.each([
    ["taken-down-file-broken-yaml", "file", "yaml-syntax"],
    ["taken-down-file-not-a-list", "slugs", "list"],
    ["taken-down-file-bad-entry", "slugs", "kebab-case"],
  ])("rejects a taken-down Slug list in fixture %s: %s breaks %s", async (fixtureName, field, rule) => {
    await expect(loadContent(fixture(fixtureName))).rejects.toMatchObject({
      problems: [{ file: "taken-down.yml", field, rule }],
    });
  });

  it("reports a bad Slug even when the Post's frontmatter is also broken", async () => {
    const error = await loadContent(fixture("bad-slug-and-yaml")).catch((e: unknown) => e);

    expect((error as ContentValidationError).problems.map((p) => p.rule).sort()).toEqual([
      "kebab-case",
      "yaml-syntax",
    ]);
  });
});

describe("promo images", () => {
  it("gives a Post without promo frontmatter the contour template, no title lines (the title wraps) and its description as the point", async () => {
    const content = await loadContent(fixture("valid"));

    const result = content.resolveSlug("hello-world");

    expect(result.kind === "post" && result.post.promo).toEqual({
      template: "contour",
      titleLines: undefined,
      points: ["第一篇文章"],
    });
  });
});

describe("promo frontmatter", () => {
  const promoOf = async (slug: string) => {
    const result = (await loadContent(fixture("promo"))).resolveSlug(slug);
    return result.kind === "post" ? result.post.promo : undefined;
  };

  it("takes the title's line breaks and the key points from promo frontmatter", async () => {
    expect(await promoOf("key-points")).toEqual({
      template: "contour",
      titleLines: ["讓 AI 寫程式，", "也有工程流程"],
      points: ["先釐清需求", "再拆成票"],
    });
  });

  it("gives the flow template its steps, each with a name and an optional command", async () => {
    expect(await promoOf("process")).toEqual({
      template: "flow",
      titleLines: undefined,
      points: ["一段流程。"],
      steps: [{ name: "釐清需求", command: "/grilling" }, { name: "上線" }],
    });
  });

  it("gives the terminal template its lines, each a command with an optional comment", async () => {
    expect(await promoOf("coding")).toEqual({
      template: "terminal",
      titleLines: undefined,
      points: ["一段程式。"],
      lines: [{ command: "npx skills add mattpocock/skills", comment: "安裝" }, { command: "/tdd" }],
    });
  });
});

describe("validating promo frontmatter", () => {
  it.each([
    ["promo-not-a-mapping", "posts/promo-list/index.mdx", "promo", "mapping", "titleLines"],
    ["promo-unknown-template", "posts/vertical-title/index.mdx", "promo.template", "promo-template", '"vertical"'],
    ["promo-flow-without-steps", "posts/stepless-flow/index.mdx", "promo.steps", "required", "flow"],
    ["promo-terminal-without-lines", "posts/lineless-terminal/index.mdx", "promo.lines", "required", "terminal"],
    ["promo-step-without-name", "posts/nameless-step/index.mdx", "promo.steps", "required", "Step 2"],
    ["promo-line-without-command", "posts/commandless-line/index.mdx", "promo.lines", "required", "Line 1"],
    ["promo-title-lines-mismatch", "posts/other-title/index.mdx", "promo.titleLines", "title-lines-match-title", "標題，第二段"],
    ["promo-blank-point", "posts/blank-point/index.mdx", "promo.points", "required", "Point 2"],
    ["promo-no-points", "posts/pointless/index.mdx", "promo.points", "at-least-one-point", "description"],
    ["promo-blank-command", "posts/blank-command/index.mdx", "promo.steps", "non-empty-text", "Step 2's command"],
    ["promo-steps-on-contour", "posts/contour-with-steps/index.mdx", "promo.steps", "template-field", "flow"],
  ])("rejects fixture %s: %s %s breaks %s, naming %s", async (fixtureName, file, field, rule, named) => {
    const error = await loadContent(fixture(fixtureName)).catch((e: unknown) => e);

    expect(error).toMatchObject({ problems: [{ file, field, rule }] });
    expect((error as Error).message).toContain(named);
  });
});

describe("a Post's LinkedIn share", () => {
  it("reads the text in linkedin.txt next to the Post, not yet posted", async () => {
    const content = await loadContent(fixture("linkedin"));

    expect(post(content, "shared").linkedInShare).toEqual({ text: "一段介紹。\n\n#Python #程式設計", postedUrl: undefined });
  });

  it("reads the link a posted share was recorded with, apart from its text", async () => {
    const content = await loadContent(fixture("linkedin"));

    expect(post(content, "posted").linkedInShare).toEqual({
      text: "已經發過的介紹。",
      postedUrl: "https://www.linkedin.com/feed/update/urn:li:share:7000000000000000000/",
    });
  });

  it("has none for a Post without linkedin.txt", async () => {
    const content = await loadContent(fixture("linkedin"));

    expect(post(content, "not-shared").linkedInShare).toBeUndefined();
  });

  it.each([
    ["linkedin-too-long", "posts/long/linkedin.txt", "text", "linkedin-length", /3001 characters, more than LinkedIn's 3000/],
    ["linkedin-hashtags", "posts/many-tags/linkedin.txt", "text", "linkedin-hashtags", /4 hashtags \(#a, #b, #c, #d\); keep it to 3/],
    ["linkedin-empty", "posts/empty/linkedin.txt", "text", "required", /no text/],
    ["linkedin-posted-url", "posts/bad-posted/linkedin.txt", "posted", "linkedin-posted-url", /"https:\/\/example.com\/x"/],
  ])("rejects fixture %s: %s %s breaks %s", async (fixtureName, file, field, rule, message) => {
    const error = await loadContent(fixture(fixtureName)).catch((e: unknown) => e);

    expect(error).toMatchObject({ problems: [{ file, field, rule }] });
    expect((error as Error).message).toMatch(message);
  });

  function post(content: Awaited<ReturnType<typeof loadContent>>, slug: string) {
    const result = content.resolveSlug(slug);
    if (result.kind !== "post") throw new Error(`${slug} is ${result.kind}`);
    return result.post;
  }
});
