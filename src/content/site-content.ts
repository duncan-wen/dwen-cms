import path from "node:path";
import { type Content, loadContent } from "./content";

/** The site's content directory. */
export const contentDir = path.join(process.cwd(), "content");

let content: Promise<Content> | undefined;

/** The site's validated content, loaded once per process. */
export function getContent(): Promise<Content> {
  content ??= loadContent(contentDir);
  return content;
}
