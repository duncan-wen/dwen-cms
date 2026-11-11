import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { expect, test } from "vitest";

// CI runs the smoke tests inside Playwright's container image; a tag behind the
// installed @playwright/test leaves Chromium's system packages out of step with it.
test("CI's Playwright image matches the installed @playwright/test", () => {
  const require = createRequire(import.meta.url);
  const { version } = require("@playwright/test/package.json") as { version: string };
  const ci = readFileSync(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");
  const tag = /mcr\.microsoft\.com\/playwright:v([\d.]+)-/.exec(ci)?.[1];
  expect(tag, "set the check job's container to mcr.microsoft.com/playwright:v<version>-noble").toBe(version);
});
