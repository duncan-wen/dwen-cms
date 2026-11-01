import path from "node:path";
import { type Content, loadContent } from "./content";

/**
 * The site's content directory: `CONTENT_DIR` if set (the smoke suite uses
 * `e2e/content`), else `content`. Content is read only at build time, so the
 * output's file trace leaves it out.
 */
export const contentDir = path.resolve(
  /*turbopackIgnore: true*/ process.cwd(),
  process.env.CONTENT_DIR ?? "content",
);

let content: Promise<Content> | undefined;

/** The site's validated content, loaded once per process. */
export function getContent(): Promise<Content> {
  content ??= loadContent(contentDir);
  return content;
}
