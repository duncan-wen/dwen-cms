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
  /** Raw MDX body, without frontmatter. */
  body: string;
};

export type SlugResolution = { kind: "post"; post: Post } | { kind: "not-found" };

export type Content = {
  /** Every Published Post, newest first; Posts sharing a date are in Slug order. */
  listPublishedPosts(): Post[];
  resolveSlug(slug: string): SlugResolution;
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

const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** The approved Tag list, relative to the content directory. */
const TAGS_FILE = "tags.yml";

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

  for (const slug of slugs) {
    const file = `posts/${slug}/index.mdx`;
    const report = (field: string, rule: string, message: string) =>
      problems.push({ file, field, rule, message });

    if (!KEBAB_CASE.test(slug)) {
      report("slug", "kebab-case", "the folder name must be lowercase English kebab-case");
    }

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

    posts.push({
      slug,
      title: title ?? "",
      description: description ?? "",
      date: date ?? "",
      tags,
      body,
    });
  }

  if (problems.length > 0) throw new ContentValidationError(problems);

  posts.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  const bySlug = new Map(posts.map((post) => [post.slug, post]));
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
      return post ? { kind: "post", post } : { kind: "not-found" };
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
async function loadApprovedTags(
  contentDir: string,
  problems: ContentProblem[],
): Promise<Set<string> | undefined> {
  const report = (field: string, rule: string, message: string) =>
    problems.push({ file: TAGS_FILE, field, rule, message });

  const source = await readFile(path.join(contentDir, TAGS_FILE), "utf8").catch(() => undefined);
  if (source === undefined) {
    report("file", "required", "the content directory needs an approved Tag list");
    return undefined;
  }
  let list: unknown;
  try {
    list = loadYaml(source, { schema: CORE_SCHEMA });
  } catch (error) {
    report("file", "yaml-syntax", (error as Error).message.split("\n")[0]);
    return undefined;
  }
  if (!Array.isArray(list)) {
    report("tags", "list", "must be a YAML list of Tags, e.g. - nextjs");
    return undefined;
  }
  const approved = new Set<string>();
  for (const tag of list as unknown[]) {
    if (typeof tag === "string" && KEBAB_CASE.test(tag)) approved.add(tag);
    else report("tags", "kebab-case", `${JSON.stringify(tag)} must be lowercase English kebab-case`);
  }
  return approved;
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
