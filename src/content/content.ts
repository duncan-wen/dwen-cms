import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { createProcessor } from "@mdx-js/mdx";
import matter from "gray-matter";
import { imageSize } from "image-size";
import { CORE_SCHEMA, load as loadYaml } from "js-yaml";
import { type MdNode, mdNodes, mermaidBlocks } from "../mdx/md-tree";
import { mermaidSvg } from "../mdx/mermaid-svg";
import { DRAWN_DIAGRAM_TYPES, type ParsedMermaid, parseMermaid } from "../mdx/parse-mermaid";

export type Post = {
  slug: string;
  title: string;
  description: string;
  /** Publication date as YYYY-MM-DD. */
  date: string;
  tags: string[];
  /** Slugs this Post had before, each redirected permanently to `slug`. */
  previousSlugs: string[];
  /**
   * The Revision with the latest date (of those sharing it, the one listed
   * last), shown to Readers as 「更新於」; undefined when the Post has had
   * only Corrections.
   */
  latestRevision: Revision | undefined;
  /** The image from the `cover` field, shown instead of the generated cover; optional. */
  cover: PostImage | undefined;
  /** Every image the body references, keyed by the reference as the body writes it. */
  images: Record<string, PostImage>;
  /** What the Post's promo images (文宣圖) show, from its `promo` frontmatter. */
  promo: Promo;
  /** Raw MDX body, without frontmatter. */
  body: string;
};

/**
 * What a Post's promo images show. Every template shows the title and the key
 * `points`; flow adds numbered steps and terminal a box of commands. The
 * templates and their fields are PROMO_TEMPLATES'.
 */
export type Promo = ReturnType<(typeof PROMO_TEMPLATES)[PromoTemplate]>;

/** A promo image template's name, e.g. `flow`. */
export type PromoTemplate = keyof typeof PROMO_TEMPLATES;

/** The fields every promo template shows. */
type PromoText = {
  /**
   * The title's lines, each kept on one line: the title shrinks until the
   * longest fits. Undefined when the Post doesn't say; the title then wraps.
   */
  titleLines: string[] | undefined;
  points: string[];
};

/** One step of a flow promo image: its name, and the command that runs it if any. */
export type FlowStep = { name: string; command?: string };

/** One line of a terminal promo image: a command, and the comment after it if any. */
export type TerminalLine = { command: string; comment?: string };

/** An image stored next to a Post. */
export type PostImage = {
  /** Path relative to the Post's folder, with forward slashes. */
  file: string;
  width: number;
  height: number;
};

/** Standalone undated content outside listings, such as the About page. */
export type Page = {
  /** The Page's folder name under `pages/`, lowercase English kebab-case. */
  name: string;
  title: string;
  description: string;
  /** Raw MDX body, without frontmatter. */
  body: string;
};

/** A substantive change to a Published Post: when it happened and what changed. */
export type Revision = { date: string; note: string };

export type SlugResolution =
  | { kind: "post"; post: Post }
  /** An old Slug; `to` is the Post's current Slug. */
  | { kind: "redirect"; to: string }
  /** A Slug whose Post was taken down; its URL answers 410 Gone. */
  | { kind: "taken-down" }
  | { kind: "not-found" };

export type Content = {
  /** Every Published Post, newest first; Posts sharing a date are in Slug order. */
  listPublishedPosts(): Post[];
  resolveSlug(slug: string): SlugResolution;
  /** Every Slug in the taken-down Slug list, in Slug order. */
  listTakenDownSlugs(): string[];
  /** The Posts carrying `tag`, in listPublishedPosts order; empty for an unused Tag. */
  listPostsByTag(tag: string): Post[];
  /**
   * Every Tag at least one Post carries, with its Post count; most Posts
   * first, ties in name order. Approved Tags no Post uses are left out.
   */
  listTagsWithCounts(): TagCount[];
  /** The Page in `pages/<name>/index.mdx`; undefined when there is none. */
  getPage(name: string): Page | undefined;
  /** Every Page, in name order. */
  listPages(): Page[];
  /**
   * Every image the Post uses: its cover first, then its body images, each
   * file once. Empty for a Post without images or an unknown Slug.
   */
  listPostImages(slug: string): PostImage[];
  /**
   * An image the Post uses (one of listPostImages), by its `file`: its bytes
   * and media type. Undefined for any other file.
   */
  readPostImage(slug: string, file: string): Promise<PostImageFile | undefined>;
};

/** An image file's bytes and its media type, e.g. `image/png`. */
export type PostImageFile = { bytes: Uint8Array; type: string };

export type TagCount = { tag: string; count: number };

export type ContentProblem = {
  /** Path relative to the content directory, with forward slashes. */
  file: string;
  field: string;
  rule: string;
  message: string;
};

export class ContentValidationError extends Error {
  constructor(readonly problems: ContentProblem[]) {
    super(
      `Content is invalid:\n${problems
        .map((p) => `  ${p.file}: ${p.field}: ${p.message} [${p.rule}]`)
        .join("\n")}`,
    );
    this.name = "ContentValidationError";
  }
}

/** A Post's file, relative to the content directory. */
const postFile = (slug: string) => `posts/${slug}/index.mdx`;

/** A Page's file, relative to the content directory. */
const pageFile = (name: string) => `pages/${name}/index.mdx`;

/** Advice for a taken-down Slug used as a current or previous Slug. */
const takenDownSlugAdvice = (slug: string) =>
  `"${slug}" is in the taken-down Slug list (${TAKEN_DOWN_FILE}); a taken-down Slug can never be reused as a current or previous Slug`;

const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Image formats the site can size and optimise: the media type of each type image-size reports. */
const IMAGE_FORMATS: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
};

/** The media type of an image in one of IMAGE_FORMATS; undefined for anything else. */
function imageFormat(bytes: Uint8Array) {
  try {
    const size = imageSize(bytes);
    return size.type && Object.hasOwn(IMAGE_FORMATS, size.type)
      ? { ...size, mediaType: IMAGE_FORMATS[size.type] }
      : undefined;
  } catch {
    return undefined;
  }
}

/** The approved Tag list, relative to the content directory. */
const TAGS_FILE = "tags.yml";

/** The taken-down Slug list, relative to the content directory; optional. */
const TAKEN_DOWN_FILE = "taken-down.yml";

/**
 * Loads and validates every Post and Page under `contentDir`.
 * Throws a ContentValidationError listing every problem found.
 */
export async function loadContent(contentDir: string): Promise<Content> {
  const postsDir = path.join(contentDir, "posts");
  const slugs = (await readdir(postsDir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  const problems: ContentProblem[] = [];
  const posts: Post[] = [];
  const approvedTags = await loadApprovedTags(contentDir, problems);
  const takenDownSlugs = await loadTakenDownSlugs(contentDir, problems);
  const pages = await loadPages(contentDir, problems);

  for (const slug of slugs) {
    const file = postFile(slug);
    const report = (field: string, rule: string, message: string) =>
      problems.push({ file, field, rule, message });

    if (!KEBAB_CASE.test(slug)) {
      report("slug", "kebab-case", "the folder name must be lowercase English kebab-case");
    }
    if (takenDownSlugs.has(slug)) report("slug", "taken-down-slug", takenDownSlugAdvice(slug));

    const parsed = await readMdx(contentDir, file, "every Post folder needs an index.mdx", report);
    if (parsed === undefined) continue;
    const { data, body, bodyLine } = parsed;

    const title = checkText(data.title, "title", report);
    const description = checkText(data.description, "description", report);
    const date = checkDate(data.date, report);
    const tags = checkTags(data.tags, approvedTags, report);
    const previousSlugs = checkPreviousSlugs(data.previousSlugs, takenDownSlugs, report);
    const latestRevision = checkRevisions(data.revisions, date, report);
    const postDir = path.join(postsDir, slug);
    const cover = await checkCover(data.cover, postDir, report);
    const tree = parseBody(body, report);
    const images = tree ? await checkBodyImages(tree, postDir, report) : {};
    if (tree) await checkDiagrams(tree, bodyLine, report);
    const promo = checkPromo(data.promo, title, description, report);

    posts.push({
      slug,
      title: title ?? "",
      description: description ?? "",
      date: date ?? "",
      tags,
      previousSlugs,
      latestRevision,
      cover,
      images,
      promo,
      body,
    });
  }

  checkPreviousSlugClaims(slugs, posts, problems);

  if (problems.length > 0) throw new ContentValidationError(problems);

  posts.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  const bySlug = new Map(posts.map((post) => [post.slug, post]));
  const redirects = new Map(
    posts.flatMap((post) =>
      post.previousSlugs.map((previousSlug) => [previousSlug, post.slug] as const),
    ),
  );
  const counts = new Map<string, number>();
  for (const tag of posts.flatMap((post) => post.tags)) {
    counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  const tagCounts: TagCount[] = [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));

  return {
    listPublishedPosts() {
      return [...posts];
    },
    resolveSlug(slug) {
      const post = bySlug.get(slug);
      if (post) return { kind: "post", post };
      const to = redirects.get(slug);
      if (to) return { kind: "redirect", to };
      return takenDownSlugs.has(slug) ? { kind: "taken-down" } : { kind: "not-found" };
    },
    listTakenDownSlugs() {
      return [...takenDownSlugs].sort();
    },
    listPostsByTag(tag) {
      return posts.filter((post) => post.tags.includes(tag));
    },
    listTagsWithCounts() {
      return [...tagCounts];
    },
    getPage(name) {
      return pages.get(name);
    },
    listPages() {
      return [...pages.values()].sort((a, b) => a.name.localeCompare(b.name));
    },
    listPostImages,
    async readPostImage(slug, file) {
      if (!listPostImages(slug).some((image) => image.file === file)) return undefined;
      const bytes = await readFile(path.join(postsDir, slug, file));
      return { bytes, type: imageFormat(bytes)!.mediaType };
    },
  };

  function listPostImages(slug: string): PostImage[] {
    const post = bySlug.get(slug);
    if (!post) return [];
    const byFile = new Map<string, PostImage>();
    for (const image of [post.cover, ...Object.values(post.images)]) {
      if (image && !byFile.has(image.file)) byFile.set(image.file, image);
    }
    return [...byFile.values()];
  }
}

/**
 * Loads and validates every Page under `pages/`, keyed by name. The folder
 * is optional: without it there are no Pages.
 */
async function loadPages(contentDir: string, problems: ContentProblem[]) {
  const pages = new Map<string, Page>();
  const entries = await readdir(path.join(contentDir, "pages"), { withFileTypes: true }).catch(
    () => [],
  );
  for (const name of entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)) {
    const file = pageFile(name);
    const report: Report = (field, rule, message) => problems.push({ file, field, rule, message });

    if (!KEBAB_CASE.test(name)) {
      report("name", "kebab-case", "the folder name must be lowercase English kebab-case");
    }
    const parsed = await readMdx(contentDir, file, "every Page folder needs an index.mdx", report);
    if (parsed === undefined) continue;
    const title = checkText(parsed.data.title, "title", report);
    const description = checkText(parsed.data.description, "description", report);
    pages.set(name, { name, title: title ?? "", description: description ?? "", body: parsed.body });
  }
  return pages;
}

/**
 * Reads an MDX file and splits its frontmatter from its body. Reports a
 * missing file (with `missing` as the advice) or broken YAML and returns
 * undefined.
 */
async function readMdx(contentDir: string, file: string, missing: string, report: Report) {
  const source = await readFile(path.join(contentDir, file), "utf8").catch(() => undefined);
  if (source === undefined) {
    report("file", "required", missing);
    return undefined;
  }
  try {
    const { data, content: body } = matter(source, { engines: { yaml: parseYaml } });
    // The body is the end of the file, so its first line sits this many lines in.
    const bodyLine = source.split("\n").length - body.split("\n").length;
    return { data, body, bodyLine };
  } catch (error) {
    report("frontmatter", "yaml-syntax", (error as Error).message.split("\n")[0]);
    return undefined;
  }
}

/**
 * Reads the approved Tag list. Reports problems with the file itself and
 * returns undefined when the list can't be used, so Post Tags aren't
 * checked against a broken list.
 */
function loadApprovedTags(contentDir: string, problems: ContentProblem[]) {
  return loadKebabCaseList(contentDir, problems, {
    file: TAGS_FILE,
    field: "tags",
    missing: "the content directory needs an approved Tag list",
    example: "must be a YAML list of Tags, e.g. - nextjs",
  });
}

/**
 * Reads the taken-down Slug list. The file is optional: without it no
 * Slug is taken down.
 */
async function loadTakenDownSlugs(contentDir: string, problems: ContentProblem[]) {
  return (
    (await loadKebabCaseList(contentDir, problems, {
      file: TAKEN_DOWN_FILE,
      field: "slugs",
      example: "must be a YAML list of Slugs, e.g. - old-post",
    })) ?? new Set<string>()
  );
}

/**
 * Reads a data file holding a YAML list of kebab-case names. Reports
 * problems with the file and returns undefined when the list can't be used.
 * A missing file is a problem only when `missing` gives the message for it.
 */
async function loadKebabCaseList(
  contentDir: string,
  problems: ContentProblem[],
  list: { file: string; field: string; example: string; missing?: string },
): Promise<Set<string> | undefined> {
  const report: Report = (field, rule, message) =>
    problems.push({ file: list.file, field, rule, message });

  const source = await readFile(path.join(contentDir, list.file), "utf8").catch(() => undefined);
  if (source === undefined) {
    if (list.missing !== undefined) report("file", "required", list.missing);
    return undefined;
  }
  let entries: unknown;
  try {
    entries = loadYaml(source, { schema: CORE_SCHEMA });
  } catch (error) {
    report("file", "yaml-syntax", (error as Error).message.split("\n")[0]);
    return undefined;
  }
  if (!Array.isArray(entries)) {
    report(list.field, "list", list.example);
    return undefined;
  }
  const names = new Set<string>();
  for (const entry of entries as unknown[]) {
    if (typeof entry === "string" && KEBAB_CASE.test(entry)) names.add(entry);
    else {
      report(list.field, "kebab-case", `${JSON.stringify(entry)} must be lowercase English kebab-case`);
    }
  }
  return names;
}

/**
 * A previous Slug redirects to exactly one Post, so it can't equal any
 * current Slug (every Post folder, valid or not) or be claimed by two Posts.
 * Posts are checked in Slug order, so the later Post is the one reported.
 */
function checkPreviousSlugClaims(
  currentSlugs: string[],
  posts: Post[],
  problems: ContentProblem[],
) {
  const current = new Set(currentSlugs);
  const claimedBy = new Map<string, string>();
  for (const post of [...posts].sort((a, b) => a.slug.localeCompare(b.slug))) {
    const report = (rule: string, message: string) =>
      problems.push({ file: postFile(post.slug), field: "previousSlugs", rule, message });
    for (const previousSlug of post.previousSlugs) {
      const claimant = claimedBy.get(previousSlug);
      if (current.has(previousSlug)) {
        report(
          "previous-slug-is-current",
          `"${previousSlug}" is the current Slug of ${postFile(previousSlug)}; no previous Slug may equal any current Slug`,
        );
      } else if (claimant !== undefined && claimant !== post.slug) {
        report(
          "previous-slug-claimed-twice",
          `"${previousSlug}" is already a previous Slug of ${postFile(claimant)}; no two Posts may claim the same previous Slug`,
        );
      } else {
        claimedBy.set(previousSlug, post.slug);
      }
    }
  }
}

/** Records one problem with a frontmatter field of the file being checked. */
type Report = (field: string, rule: string, message: string) => void;

/*
 * The check helpers below validate frontmatter: each reports its problems
 * and returns the parsed value (undefined, or only the valid entries, when
 * the value is invalid). check<Field> owns one field's rules; checkText and
 * checkList own one rule shared by several fields.
 */

/** A required text field such as `title`: non-empty text. */
function checkText(value: unknown, field: string, report: Report): string | undefined {
  const text = requiredString(value);
  if (text === undefined) report(field, "required", "must be a non-empty string");
  return text;
}

/** The Post's `date`: required, a real date written YYYY-MM-DD. */
function checkDate(value: unknown, report: Report): string | undefined {
  if (value === undefined) {
    report("date", "required", "is missing");
    return undefined;
  }
  const date = isoDate(value);
  if (date === undefined) report("date", "date-format", "must be a date written YYYY-MM-DD");
  return date;
}

/** The Post's `tags`: at least one lowercase, approved Tag, none repeated. */
function checkTags(value: unknown, approvedTags: Set<string> | undefined, report: Report) {
  const tags: string[] = [];
  const entries = checkList(value, "tags", "must be a list, e.g. tags: [nextjs]", report);
  if (entries === undefined) return tags;
  if (entries.length === 0) report("tags", "at-least-one-tag", "must list at least one Tag");
  for (const entry of entries) {
    const name = requiredString(entry);
    if (name === undefined) {
      report("tags", "non-empty-tag", "every Tag must be non-empty text");
    } else if (name !== name.toLowerCase()) {
      report("tags", "lowercase", `"${name}" must be lowercase; write "${name.toLowerCase()}"`);
    } else if (approvedTags && !approvedTags.has(name)) {
      report(
        "tags",
        "approved-tag",
        `"${name}" isn't in the approved Tag list (${TAGS_FILE}); use an approved Tag, or add it there and give the reason in the PR`,
      );
    } else if (tags.includes(name)) {
      report("tags", "duplicate-tag", `"${name}" is listed more than once`);
    } else {
      tags.push(name);
    }
  }
  return tags;
}

/**
 * The Post's `previousSlugs`: optional kebab-case Slugs, none taken down.
 * Rules spanning Posts are checked later by checkPreviousSlugClaims.
 */
function checkPreviousSlugs(value: unknown, takenDownSlugs: Set<string>, report: Report) {
  const previousSlugs: string[] = [];
  const entries = checkList(
    value,
    "previousSlugs",
    "must be a list, e.g. previousSlugs: [old-slug]",
    report,
  );
  for (const entry of entries ?? []) {
    if (typeof entry === "string" && KEBAB_CASE.test(entry)) {
      previousSlugs.push(entry);
      if (takenDownSlugs.has(entry)) {
        report("previousSlugs", "taken-down-slug", takenDownSlugAdvice(entry));
      }
    } else {
      report("previousSlugs", "kebab-case", `${JSON.stringify(entry)} must be lowercase English kebab-case`);
    }
  }
  return previousSlugs;
}

/**
 * The "must be a list" rule for a frontmatter field. Returns the entries,
 * an empty list when the field is absent, or undefined after reporting a
 * value that isn't a list.
 */
function checkList(
  value: unknown,
  field: string,
  message: string,
  report: Report,
): unknown[] | undefined {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    report(field, "list", message);
    return undefined;
  }
  return value;
}

/**
 * Validates a Post's Revision entries and returns the latest valid one.
 * `postDate` is undefined when the Post's own date is invalid, so the
 * on-or-after rule isn't checked against it.
 */
function checkRevisions(
  value: unknown,
  postDate: string | undefined,
  report: Report,
): Revision | undefined {
  const entries = checkList(
    value,
    "revisions",
    "must be a list of Revisions, each with a date and a note, e.g. revisions: [{ date: 2026-10-20, note: 補上效能比較 }]",
    report,
  );
  let latest: Revision | undefined;
  (entries ?? []).forEach((entry, index) => {
    const which = `Revision ${index + 1}`;
    const fields = (typeof entry === "object" && entry !== null ? entry : {}) as {
      date?: unknown;
      note?: unknown;
    };
    const date = isoDate(fields.date);
    const note = requiredString(fields.note);
    if (date === undefined) {
      report("revisions", "date-format", `${which} needs a date written YYYY-MM-DD`);
    } else if (postDate !== undefined && date < postDate) {
      report(
        "revisions",
        "revision-on-or-after-post",
        `${which} is dated ${date}, before the Post's date ${postDate}; Revision dates must be on or after the Post's date`,
      );
    }
    if (note === undefined) {
      report("revisions", "required", `${which} needs a note: non-empty text saying what changed`);
    }
    if (date !== undefined && note !== undefined && !(latest && latest.date > date)) {
      latest = { date, note };
    }
  });
  return latest;
}

/** The Post's `cover`: optional, an image stored next to the Post. */
async function checkCover(value: unknown, postDir: string, report: Report) {
  if (value === undefined) return undefined;
  if (requiredString(value) === undefined) {
    report("cover", "image-path", "must be an image file next to the Post, e.g. cover: cover.jpg");
    return undefined;
  }
  return checkImage(value as string, "cover", postDir, report);
}

/** Parses an MDX body into its syntax tree; reports invalid MDX and returns undefined. */
function parseBody(body: string, report: Report): MdNode | undefined {
  try {
    return createProcessor().parse(body) as MdNode;
  } catch (error) {
    report("body", "mdx-syntax", (error as Error).message.split("\n")[0]);
    return undefined;
  }
}

/**
 * Every Markdown image in the body, `![alt](./diagram.png)`, keyed by its
 * reference. Code blocks are text, so an image written inside one isn't a reference.
 */
async function checkBodyImages(tree: MdNode, postDir: string, report: Report) {
  const refs = new Set<string>();
  for (const node of mdNodes(tree)) {
    if (node.type === "image" && typeof node.url === "string") refs.add(node.url);
  }
  const images: Record<string, PostImage> = {};
  for (const ref of refs) {
    const image = await checkImage(ref, "body", postDir, report);
    if (image) images[ref] = image;
  }
  return images;
}

/**
 * Every ```mermaid block in the body must parse as Mermaid, be a diagram type
 * the site can draw, give a flowchart's nodes ASCII IDs, and draw with the
 * site's renderer (mermaidSvg), which reads less than Mermaid does. Each
 * problem names the block by its position among the body's Mermaid blocks and
 * its line in the file; `bodyLine` is how many lines into the file the body starts.
 */
async function checkDiagrams(tree: MdNode, bodyLine: number, report: Report) {
  const blocks = mermaidBlocks(tree);
  for (const [index, block] of blocks.entries()) {
    const which = `Mermaid block ${index + 1} (line ${bodyLine + (block.position?.start.line ?? 1)})`;
    const source = block.value ?? "";
    let parsed: ParsedMermaid;
    try {
      parsed = await parseMermaid(source);
    } catch (error) {
      report("body", "mermaid-syntax", `${which} isn't valid Mermaid (${firstLine(error)}); try it at https://mermaid.live`);
      continue;
    }
    if (!DRAWN_DIAGRAM_TYPES.has(parsed.diagramType)) {
      report(
        "body",
        "mermaid-diagram-type",
        `${which} is a ${parsed.diagramType} diagram, which the site can't draw; use a ${DRAWN_DIAGRAM_TYPES_HINT} diagram`,
      );
      continue;
    }
    const nonAscii = parsed.nodeIds.filter((id) => /[^\x20-\x7e]/.test(id));
    if (nonAscii.length > 0) {
      report(
        "body",
        "mermaid-ascii-id",
        `${which} has node IDs that aren't ASCII (${nonAscii.map((id) => JSON.stringify(id)).join(", ")}), which the site's renderer can't draw; write each ID in ASCII and its label in Chinese, e.g. review{審閱}`,
      );
    }
    try {
      mermaidSvg(source, "check");
    } catch (error) {
      report(
        "body",
        "mermaid-render",
        `${which} is valid Mermaid, but the site's renderer can't draw it (${firstLine(error)})`,
      );
    }
  }
}

/** The diagram types the site draws, as a writer names them: "flowchart, state, … or xychart". */
const DRAWN_DIAGRAM_TYPES_HINT = new Intl.ListFormat("en", { type: "disjunction" }).format(
  DRAWN_DIAGRAM_TYPES.values(),
);

/** The first line of a thrown error's message. */
function firstLine(error: unknown): string {
  return String((error as Error).message).split("\n")[0];
}

/**
 * An image reference, from the body or the cover: a file next to the Post
 * in a format the site can size. Returns its file and dimensions.
 */
async function checkImage(ref: string, field: string, postDir: string, report: Report) {
  const file = path.posix.normalize(ref);
  const advice = `referenced images must exist next to the Post, as a path relative to its folder`;
  if (/^[a-z][a-z0-9+.-]*:/i.test(ref) || path.posix.isAbsolute(file) || file.startsWith("../")) {
    report(field, "image-exists", `"${ref}" isn't next to the Post; ${advice}`);
    return undefined;
  }
  const bytes = await readFile(path.join(postDir, file)).catch(() => undefined);
  if (bytes === undefined) {
    report(field, "image-exists", `"${ref}" doesn't exist; ${advice}`);
    return undefined;
  }
  const size = imageFormat(bytes);
  if (!size?.width || !size.height) {
    report(field, "image-format", `"${ref}" must be a PNG, JPEG, GIF, WebP or AVIF image`);
    return undefined;
  }
  // A JPEG's EXIF orientation 5-8 rotates it a quarter turn when displayed.
  const turned = (size.orientation ?? 1) >= 5;
  return {
    file,
    width: turned ? size.height : size.width,
    height: turned ? size.width : size.height,
  };
}

/**
 * The promo templates, the default first, and the only place their names are
 * written: each builds its Promo from the text every template shows and checks
 * the fields only it takes.
 */
const PROMO_TEMPLATES = {
  contour: (text: PromoText) => ({ template: "contour" as const, ...text }),
  flow: (text: PromoText, fields: Record<string, unknown>, report: Report) => ({
    template: "flow" as const,
    ...text,
    steps: checkPromoEntries(fields.steps, {
      field: "steps",
      needs: "the flow template needs steps, each with a name and an optional command, e.g. steps: [{ name: 釐清需求, command: /grilling }]",
      which: "Step",
      required: "name",
      optional: "command",
      entry: (name, command): FlowStep => (command === undefined ? { name } : { name, command }),
      report,
    }),
  }),
  terminal: (text: PromoText, fields: Record<string, unknown>, report: Report) => ({
    template: "terminal" as const,
    ...text,
    lines: checkPromoEntries(fields.lines, {
      field: "lines",
      needs: "the terminal template needs lines, each a command with an optional comment, e.g. lines: [{ command: pnpm promo my-post, comment: 產生文宣圖 }]",
      which: "Line",
      required: "command",
      optional: "comment",
      entry: (command, comment): TerminalLine => (comment === undefined ? { command } : { command, comment }),
      report,
    }),
  }),
};

const [DEFAULT_TEMPLATE, ...OTHER_TEMPLATES] = Object.keys(PROMO_TEMPLATES) as PromoTemplate[];

/** The promo fields only one template takes, with that template. */
const TEMPLATE_FIELDS = { steps: "flow", lines: "terminal" } as const satisfies Record<
  string,
  PromoTemplate
>;

/**
 * The Post's `promo`: optional, and each of its fields too. Without them the
 * promo images use the default template, the title wrapping on its own and
 * the description as the only point. `title` and `description` are undefined
 * when the Post's own fields are invalid, so nothing is checked against them.
 */
function checkPromo(
  value: unknown,
  title: string | undefined,
  description: string | undefined,
  report: Report,
): Promo {
  const defaultText: PromoText = { titleLines: undefined, points: [description ?? ""] };
  const defaults = PROMO_TEMPLATES[DEFAULT_TEMPLATE](defaultText, {}, report);
  if (value === undefined) return defaults;
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    report(
      "promo",
      "mapping",
      "must be a mapping of promo fields, e.g. promo: { template: flow, titleLines: […], points: […], steps: […] }",
    );
    return defaults;
  }
  const fields = value as Record<string, unknown>;

  const template = fields.template ?? DEFAULT_TEMPLATE;
  if (!isPromoTemplate(template)) {
    const others = new Intl.ListFormat("en", { type: "disjunction" }).format(OTHER_TEMPLATES);
    report(
      "promo.template",
      "promo-template",
      `${JSON.stringify(template)} isn't a promo template; use ${DEFAULT_TEMPLATE} (the default), ${others}`,
    );
  }
  for (const [field, owner] of Object.entries(TEMPLATE_FIELDS)) {
    if (fields[field] !== undefined && template !== owner) {
      report(
        `promo.${field}`,
        "template-field",
        `only the ${owner} template takes ${field}; set promo.template: ${owner}, or remove promo.${field}`,
      );
    }
  }

  const titleLines = checkPromoTexts(fields.titleLines, "titleLines", "Title line", report);
  const noSpace = (text: string) => text.replace(/\s/g, "");
  if (titleLines && title !== undefined && noSpace(titleLines.join("")) !== noSpace(title)) {
    report(
      "promo.titleLines",
      "title-lines-match-title",
      `must split the Post's title "${title}" into lines without changing its words, e.g. titleLines: [讓 AI 寫程式，, 也有工程流程]`,
    );
  }
  const points = checkPromoTexts(fields.points, "points", "Point", report);
  if (Array.isArray(fields.points) && fields.points.length === 0) {
    report(
      "promo.points",
      "at-least-one-point",
      "must list at least one point; leave promo.points out to show the description instead",
    );
  }
  const text = { titleLines, points: points ?? defaultText.points };
  return isPromoTemplate(template) ? PROMO_TEMPLATES[template](text, fields, report) : defaults;
}

function isPromoTemplate(name: unknown): name is PromoTemplate {
  return typeof name === "string" && Object.hasOwn(PROMO_TEMPLATES, name);
}

/**
 * A promo field holding a list of texts, such as `points`. Returns undefined
 * when it is absent or not a list, else its non-empty texts.
 */
function checkPromoTexts(value: unknown, field: string, which: string, report: Report) {
  if (value === undefined) return undefined;
  const entries = checkList(value, `promo.${field}`, `must be a list of texts, e.g. ${field}: […, …]`, report);
  if (entries === undefined) return undefined;
  const texts: string[] = [];
  entries.forEach((entry, index) => {
    const text = requiredString(entry);
    if (text === undefined) report(`promo.${field}`, "required", `${which} ${index + 1} must be non-empty text`);
    else texts.push(text);
  });
  return texts;
}

/**
 * A template's list of entries, such as flow's `steps`: at least one, each
 * with non-empty text for `required` and, if given, for `optional`. Returns
 * the valid entries, each built by `entry` from those two texts.
 */
function checkPromoEntries<Entry>(
  value: unknown,
  spec: {
    field: string;
    needs: string;
    which: string;
    required: string;
    optional: string;
    entry: (main: string, extra: string | undefined) => Entry;
    report: Report;
  },
): Entry[] {
  const { field, needs, which, required, optional, entry: build, report } = spec;
  const entries = checkList(value, `promo.${field}`, needs, report);
  if (entries === undefined) return [];
  if (entries.length === 0) report(`promo.${field}`, "required", needs);
  const valid: Entry[] = [];
  entries.forEach((entry, index) => {
    const fields = (typeof entry === "object" && entry !== null ? entry : {}) as Record<string, unknown>;
    const main = requiredString(fields[required]);
    const extra = requiredString(fields[optional]);
    if (main === undefined) {
      report(`promo.${field}`, "required", `${which} ${index + 1} needs a ${required}: non-empty text`);
    }
    const blankExtra = fields[optional] !== undefined && extra === undefined;
    if (blankExtra) {
      report(
        `promo.${field}`,
        "non-empty-text",
        `${which} ${index + 1}'s ${optional} must be non-empty text; give it one, or leave ${optional} out`,
      );
    }
    if (main !== undefined && !blankExtra) valid.push(build(main, extra));
  });
  return valid;
}

function requiredString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

/**
 * YAML's default schema turns `2026-13-01` into 2027-01-01. The core schema
 * keeps dates as text so isoDate can reject impossible ones.
 */
function parseYaml(source: string): Record<string, unknown> {
  return (loadYaml(source, { schema: CORE_SCHEMA }) as Record<string, unknown>) ?? {};
}

/** Returns the value if it is a real calendar date written YYYY-MM-DD. */
function isoDate(value: unknown): string | undefined {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value)
    ? value
    : undefined;
}
