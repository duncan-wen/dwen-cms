// Joins several images into one JPEG for a Post's body: a comparison, the pages of a book.
//   pnpm grid <out.jpg> <columns> <image>…
// Tiles fill rows of <columns>, each cropped to the first image's shape, 1600px wide in all.
// One image with 1 column just shrinks it to a JPEG, e.g. a 4 MB PNG a model drew.
import { readFileSync, writeFileSync } from "node:fs";
import { imageGrid } from "../src/images/image-grid";

const [out, columns, ...files] = process.argv.slice(2);
if (!out || !/\.jpe?g$/.test(out) || !/^[1-9]\d*$/.test(columns ?? "") || files.length === 0) {
  console.error("Usage: pnpm grid <out.jpg> <columns> <image>…");
  process.exit(1);
}
const grid = await imageGrid(
  files.map((file) => readFileSync(file)),
  Number(columns),
);
writeFileSync(out, grid);
console.log(`${out}: ${files.length} image(s), ${Math.round(grid.length / 1024)} KB`);
