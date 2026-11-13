import path from "node:path";

/** Where Demos are stored, each a self-contained page in `<slug>/index.html`, served as-is. */
export const DEMOS_DIR = path.join("public", "demos");

/** A Demo's own page, ending in `index.html` so the files it loads by relative path resolve. */
export function demoUrl(slug: string): string {
  return `/demos/${slug}/index.html`;
}

/** Where a Demo's page is stored, relative to the repository root. */
export function demoPagePath(slug: string): string {
  return path.join(DEMOS_DIR, slug, "index.html");
}
