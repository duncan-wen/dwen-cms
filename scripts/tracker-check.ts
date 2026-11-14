/** Checks that each spec's and ticket's Status agrees with its boxes and tickets. Usage: tracker-check [scratch-dir] */
import path from "node:path";
import { checkTracker } from "../src/tracker/tracker";

const dir = path.resolve(process.argv[2] ?? ".scratch");
const problems = await checkTracker(dir);

if (problems.length === 0) {
  console.log("Tracker OK.");
} else {
  console.error(
    `Tracker is out of date:\n${problems.map((p) => `  ${p.file}: ${p.field}: ${p.message} [${p.rule}]`).join("\n")}`,
  );
  process.exitCode = 1;
}
