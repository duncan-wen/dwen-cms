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
  /** Raw MDX body, without frontmatter. */
  body: string;
};

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

/** Advice for a taken-down Slug used as a current or previous Slug. */
const takenDownSlugAdvice = (slug: string) =>
  `"${slug}" is in the taken-down Slug list (${TAKEN_DOWN_FILE}); a taken-down Slug can never be reused as a current or previous Slug`;

const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** The approved Tag list, relative to the content directory. */
const TAGS_FILE = "tags.yml";

/** The taken-down Slug list, relative to the content directory; optional. */
const TAKEN_DOWN_FILE = "taken-down.yml";

/**
 * Loads and validates every Post under `contentDir`.
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

  for (const slug of slugs) {
    const file = postFile(slug);
    const report = (field: string, rule: string, message: string) =>
      problems.push({ file, field, rule, message });

    if (!KEBAB_CASE.test(slug)) {
      report("slug", "kebab-case", "the folder name must be lowercase English kebab-case");
    }
    if (takenDownSlugs.has(slug)) report("slug", "taken-down-slug", takenDownSlugAdvice(slug));

    const source = await readFile(path.join(contentDir, file), "utf8").catch(() => undefined);
    if (source === undefined) {
      report("file", "required", "every Post folder needs an index.mdx");
      continue;
    }
    let parsed: matter.GrayMatterFile<string>;
    try {
      parsed = matter(source, { engines: { yaml: parseYaml } });
    } catch (error) {
      report("frontmatter", "yaml-syntax", (error as Error).message.split("\n")[0]);
      continue;
    }
    const { data, content: body } = parsed;


    const title = requiredString(data.title);
    if (title === undefined) report("title", "required", "must be a non-empty string");

    const description = requiredString(data.description);
    if (description === undefined) {
      report("description", "required", "must be a non-empty string");
    }

    const date = data.date === undefined ? undefined : isoDate(data.date);
    if (data.date === undefined) report("date", "required", "is missing");
    else if (date === undefined) report("date", "date-format", "must be a date written YYYY-MM-DD");

    const tags: string[] = [];
    if (data.tags !== undefined && !Array.isArray(data.tags)) {
      report("tags", "list", "must be a list, e.g. tags: [nextjs]");
    } else if (!data.tags?.length) {
      report("tags", "at-least-one-tag", "must list at least one Tag");
    } else {
      for (const tag of data.tags as unknown[]) {
        const name = requiredString(tag);
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
    }

    const previousSlugs: string[] = [];
    if (data.previousSlugs !== undefined && !Array.isArray(data.previousSlugs)) {
      report("previousSlugs", "list", "must be a list, e.g. previousSlugs: [old-slug]");
    } else {
      for (const previousSlug of (data.previousSlugs ?? []) as unknown[]) {
        if (typeof previousSlug === "string" && KEBAB_CASE.test(previousSlug)) {
          previousSlugs.push(previousSlug);
          if (takenDownSlugs.has(previousSlug)) {
            report("previousSlugs", "taken-down-slug", takenDownSlugAdvice(previousSlug));
          }
        } else {
          report(
            "previousSlugs",
            "kebab-case",
            `${JSON.stringify(previousSlug)} must be lowercase English kebab-case`,
          );
        }
      }
    }

    posts.push({
      slug,
      title: title ?? "",
      description: description ?? "",
      date: date ?? "",
      tags,
      previousSlugs,
      body,
    });
  }

  checkPreviousSlugs(slugs, posts, problems);

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
  };
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
  const report = (field: string, rule: string, message: string) =>
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
function checkPreviousSlugs(currentSlugs: string[], posts: Post[], problems: ContentProblem[]) {
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
