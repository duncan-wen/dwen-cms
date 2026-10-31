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
  /** Every Published Post, newest first. */
  listPublishedPosts(): Post[];
  resolveSlug(slug: string): SlugResolution;
};

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
        if (name === undefined) report("tags", "non-empty-tag", "every Tag must be non-empty text");
        else tags.push(name);
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

  posts.sort((a, b) => b.date.localeCompare(a.date));
  const bySlug = new Map(posts.map((post) => [post.slug, post]));

  return {
    listPublishedPosts() {
      return [...posts];
    },
    resolveSlug(slug) {
      const post = bySlug.get(slug);
      return post ? { kind: "post", post } : { kind: "not-found" };
    },
  };
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
