/**
 * Checks that each spec's and ticket's Status agrees with its boxes and tickets, in the files
 * git tracks or has staged (a local draft never blocks a commit). Usage: tracker-check [scratch-dir]
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import { checkTracker } from "../src/tracker/tracker";

const dir = path.resolve(process.argv[2] ?? ".scratch");
// Paths relative to `dir`, with forward slashes, as git prints them run from there.
const tracked = new Set(
  execFileSync("git", ["ls-files", "-z"], { cwd: dir, encoding: "utf8" }).split("\0").filter(Boolean),
);
const problems = await checkTracker(dir, { include: (file) => tracked.has(file) });

if (problems.length === 0) {
  console.log("Tracker OK.");
} else {
  console.error(
    `Tracker is out of date:\n${problems.map((p) => `  ${p.file}: ${p.field}: ${p.message} [${p.rule}]`).join("\n")}`,
  );
  process.exitCode = 1;
}
