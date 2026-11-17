import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { createProcessor } from "@mdx-js/mdx";
import { splitFrontmatter } from "../content/content";
import { codeBlocks, isWholeGoProgram, type MdNode } from "../mdx/md-tree";

const run = promisify(execFile);

/** The languages whose blocks `code:check` compiles. */
export type CodeLang = "go" | "python";

/** One code block's result: its language, the file line its opening fence is on, and why it failed. */
export type BlockResult = { lang: CodeLang; line: number; ok: boolean; detail: string };

/**
 * Compiles the whole programs in a Post's MDX file, as a Reader would copy them: each ```go block
 * with `package main` through `go vet` and `gofmt -l`, each ```python block through `py_compile`.
 * Go fragments and other languages are skipped. It finds blocks as the content check does.
 */
export async function checkCodeBlocks(mdx: string): Promise<BlockResult[]> {
  const { body, bodyLine } = splitFrontmatter(mdx);
  const tree = createProcessor().parse(body) as MdNode;
  const blocks = [
    ...codeBlocks(tree, "go")
      .filter((node) => isWholeGoProgram(node.value ?? ""))
      .map((node) => ({ lang: "go" as const, node })),
    ...codeBlocks(tree, "python").map((node) => ({ lang: "python" as const, node })),
  ].sort((a, b) => (a.node.position?.start.line ?? 0) - (b.node.position?.start.line ?? 0));
  const results: BlockResult[] = [];
  for (const { lang, node } of blocks) {
    const source = `${node.value ?? ""}\n`;
    const dir = await mkdtemp(path.join(tmpdir(), "code-check-"));
    try {
      const detail = lang === "go" ? await checkGo(dir, source) : await checkPython(dir, source);
      results.push({ lang, line: bodyLine + (node.position?.start.line ?? 1), ok: detail === "", detail });
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  }
  return results;
}

let goVersion: Promise<string> | undefined;

async function checkGo(dir: string, source: string): Promise<string> {
  goVersion ??= run("go", ["env", "GOVERSION"]).then(({ stdout }) => /go(\d+\.\d+)/.exec(stdout)?.[1] ?? "1.22");
  await writeFile(path.join(dir, "go.mod"), `module codecheck\n\ngo ${await goVersion}\n`);
  await writeFile(path.join(dir, "main.go"), source);
  const env = { ...process.env, GOTOOLCHAIN: "local", GOFLAGS: "-mod=mod" };
  const vet = await failure(run("go", ["vet", "."], { cwd: dir, env }));
  if (vet !== "") return vet;
  const { stdout } = await run("gofmt", ["-l", "main.go"], { cwd: dir });
  return stdout.trim() === "" ? "" : "gofmt would reformat it; run gofmt on the block";
}

async function checkPython(dir: string, source: string): Promise<string> {
  const file = path.join(dir, "main.py");
  await writeFile(file, source);
  return failure(run("python3", ["-I", "-m", "py_compile", file]));
}

/** Empty when the command succeeds, else what it printed. */
async function failure(command: Promise<unknown>): Promise<string> {
  try {
    await command;
    return "";
  } catch (error) {
    const { stderr, stdout, message } = error as { stderr?: string; stdout?: string; message: string };
    return (stderr || stdout || message).trim();
  }
}
