import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
// TypeScript is pinned to 6.x: typescript-eslint (pulled in here) doesn't support TS 7 yet.
import nextTs from "eslint-config-next/typescript";

const readContentThroughGetContent =
  "Pages read content through getContent() from @/content/site-content, never from files.";

// A hex colour or a CSS colour function in code: text-[#123], style, SVG fill/stroke.
// Palette classes (text-zinc-500) are handled in globals.css, which drops Tailwind's palette.
const literalColour =
  "/(^|[\\s\\[:(\"'=])#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?![\\w-])|\\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix)\\(/";
const useColourToken =
  "Colours come from the tokens in src/app/globals.css (bg-paper, text-accent, var(--accent)), never a literal.";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/app/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: ["fs", "fs/promises", "node:fs", "node:fs/promises", "gray-matter"].map((name) => ({
            name,
            message: readContentThroughGetContent,
          })),
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
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...[`Literal[value=${literalColour}]`, `TemplateElement[value.raw=${literalColour}]`].map((selector) => ({
          selector,
          message: useColourToken,
        })),
      ],
    },
  },
  globalIgnores([".next/**", "next-env.d.ts", "test-results/**", "playwright-report/**"]),
]);
