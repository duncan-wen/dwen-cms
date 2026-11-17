// Compiles the whole programs in Posts, as a Reader would copy them; Go and Python must be installed.
//   pnpm code:check [<slug>…]     (no slug: every Post; CONTENT_DIR picks the content, as the build does)
// Each ```go block with `package main` runs through `go vet` and `gofmt -l`, each ```python block
// through `py_compile`. It doesn't run them: whether the output matches the Post is checked by hand.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { checkCodeBlocks } from "../src/code-check/code-check";
import { contentDir } from "../src/content/site-content";

const postsDir = path.join(contentDir, "posts");
const slugs = process.argv.slice(2);
const targets =
  slugs.length > 0
    ? slugs
    : readdirSync(postsDir, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name);

let failed = 0;
let checked = 0;
for (const slug of targets) {
  const file = path.relative(process.cwd(), path.join(postsDir, slug, "index.mdx"));
  for (const result of await checkCodeBlocks(readFileSync(file, "utf8"))) {
    checked++;
    if (result.ok) {
      console.log(`ok    ${file}:${result.line} ${result.lang}`);
    } else {
      failed++;
      console.log(`FAIL  ${file}:${result.line} ${result.lang}\n${result.detail.replace(/^/gm, "      ")}`);
    }
  }
}
console.log(`${checked} block(s) checked, ${failed} failed`);
if (failed > 0) process.exit(1);
