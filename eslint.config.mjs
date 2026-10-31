import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
// TypeScript is pinned to 6.x: typescript-eslint (pulled in here) doesn't support TS 7 yet.
import nextTs from "eslint-config-next/typescript";

const readContentThroughGetContent =
  "Pages read content through getContent() from @/content/site-content, never from files.";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/app/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: ["fs", "fs/promises", "node:fs", "node:fs/promises", "gray-matter"].map(
            (name) => ({ name, message: readContentThroughGetContent }),
          ),
          patterns: [
            {
              regex: "(^@/content/content$|/content/content$)",
              allowTypeImports: true,
              message: readContentThroughGetContent,
            },
          ],
        },
      ],
    },
  },
  globalIgnores([".next/**", "next-env.d.ts", "test-results/**", "playwright-report/**"]),
]);
