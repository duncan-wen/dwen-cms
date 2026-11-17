// Vercel's ignoreCommand (vercel.json): exits 0 to skip a deployment's build, 1 to build it.
// Vercel runs it before installing dependencies, so it is plain TypeScript with no imports beyond
// Node's own, run as `node src/deploy/ignore-build.ts` (Node strips the types).
import { execFileSync } from "node:child_process";

/** Paths a push may change without changing the site: specs, agent docs, skills and the root's Markdown. */
const NON_SITE_PATHS = [/^\.scratch\//, /^docs\//, /^\.claude\//, /^[^/]+\.md$/];

/** Whether a push changing these paths can skip its build: only when every one leaves the site unchanged. */
export function shouldSkipBuild(changed: string[]): boolean {
  return changed.length > 0 && changed.every((file) => NON_SITE_PATHS.some((pattern) => pattern.test(file)));
}

/**
 * The files changed since this branch's last deployment, `previousSha`, as `diff` lists them; none if
 * that can't be told. A branch's first deployment has no previous one, and its last commit alone may
 * hide earlier ones, so it builds.
 */
export function changedFiles(previousSha: string | undefined, diff: (since: string) => string): string[] {
  if (!previousSha) return [];
  try {
    return diff(previousSha).split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

/** `git diff --name-only`, with a rename listed as both paths, so moving source into docs/ still builds. */
const gitDiff = (since: string) =>
  execFileSync("git", ["diff", "--name-only", "--no-renames", since, "HEAD"], { encoding: "utf8" });

if (import.meta.main) {
  const skip = shouldSkipBuild(changedFiles(process.env.VERCEL_GIT_PREVIOUS_SHA, gitDiff));
  console.log(skip ? "Only specs, docs or skills changed: skipping the build." : "Building.");
  process.exit(skip ? 0 : 1);
}
