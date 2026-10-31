/** Validates content without a Next.js build. Usage: content-check [content-dir] */
import path from "node:path";
import { ContentValidationError, loadContent } from "../src/content/content";
import { contentDir } from "../src/content/site-content";

const dir = process.argv[2] ? path.resolve(process.argv[2]) : contentDir;

try {
  const content = await loadContent(dir);
  console.log(`Content OK: ${content.listPublishedPosts().length} Published Post(s).`);
} catch (error) {
  if (!(error instanceof ContentValidationError)) throw error;
  console.error(error.message);
  process.exitCode = 1;
}
