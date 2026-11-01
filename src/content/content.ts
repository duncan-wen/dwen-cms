import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { CORE_SCHEMA, load as loadYaml } from "js-yaml";

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
  /** Raw MDX body, without frontmatter. */
  body: string;
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
};

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
    const { data, body } = parsed;

    const title = checkText(data.title, "title", report);
    const description = checkText(data.description, "description", report);
    const date = checkDate(data.date, report);
    const tags = checkTags(data.tags, approvedTags, report);
    const previousSlugs = checkPreviousSlugs(data.previousSlugs, takenDownSlugs, report);
    const latestRevision = checkRevisions(data.revisions, date, report);

    posts.push({
      slug,
      title: title ?? "",
      description: description ?? "",
      date: date ?? "",
      tags,
      previousSlugs,
      latestRevision,
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
  };
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
    return { data, body };
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
