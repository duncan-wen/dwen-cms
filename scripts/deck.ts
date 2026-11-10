// Turns a NotebookLM PDF into a Post's Slide deck. Only a Writing Agent runs it.
//   pnpm deck <slug> <path-to.pdf>
// Writes content/posts/<slug>/deck/ (CONTENT_DIR moves it): each slide as WebP, its thumbnail,
// a small download PDF and deck.yml, whose empty titles and texts the Writing Agent then fills
// by looking at each slide. The original PDF stays where it is and never enters the repo.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { deckFiles } from "../src/deck/deck-files";
import { DECK_DIR } from "../src/deck/deck-names";
import { contentDir } from "../src/content/site-content";

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const [slug, pdfPath, ...rest] = process.argv.slice(2);
if (!slug || !pdfPath || rest.length > 0) fail("Usage: pnpm deck <slug> <path-to.pdf>");
const postDir = path.join(contentDir, "posts", slug);
if (!existsSync(path.join(postDir, "index.mdx"))) fail(`There is no Post at ${postDir}; write the Post first`);
const deckDir = path.join(postDir, DECK_DIR);
if (existsSync(deckDir)) fail(`${deckDir} already exists; delete it first to convert the deck again`);

const files = await deckFiles(readFileSync(pdfPath));
mkdirSync(deckDir);
for (const [name, data] of files) writeFileSync(path.join(deckDir, name), data);
console.log(
  `Wrote ${files.size} files to ${path.relative(process.cwd(), deckDir)}; fill in deck.yml, then place <SlideDeck /> in the Post's body.`,
);
