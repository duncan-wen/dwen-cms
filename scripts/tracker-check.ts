/**
 * Checks that each spec's and ticket's Status agrees with its boxes and tickets, in the files
 * git tracks or has staged (a local draft never blocks a commit). Usage: tracker-check [scratch-dir]
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import { checkTracker } from "../src/tracker/tracker";

const dir = path.resolve(process.argv[2] ?? ".scratch");
/**
 * The files git tracks or has staged, relative to `dir` with forward slashes; undefined where git
 * can't answer (CI's container refuses a checkout it doesn't own), and then every file is checked.
 */
function trackedFiles(): Set<string> | undefined {
  try {
    const out = execFileSync("git", ["ls-files", "-z"], {
      cwd: dir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return new Set(out.split("\0").filter(Boolean));
  } catch {
    return undefined;
  }
}

const tracked = trackedFiles();
const problems = await checkTracker(dir, { include: (file) => tracked?.has(file) ?? true });

if (problems.length === 0) {
  console.log("Tracker OK.");
} else {
  console.error(
    `Tracker is out of date:\n${problems.map((p) => `  ${p.file}: ${p.field}: ${p.message} [${p.rule}]`).join("\n")}`,
  );
  process.exitCode = 1;
}
