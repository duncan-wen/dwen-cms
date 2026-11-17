import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

/** One code block's result: its language, the line its opening fence is on, and why it failed. */
export type BlockResult = { lang: "go" | "python"; line: number; ok: boolean; detail: string };

type Block = { lang: "go" | "python"; line: number; source: string };

/**
 * Compiles the whole programs in a Post's MDX, as a Reader would copy them: each ```go block with
 * `package main` through `gofmt -l` and `go vet`, each ```python block through `py_compile`.
 * Go fragments and other languages are skipped. Lines count from the start of `mdx`.
 */
export async function checkCodeBlocks(mdx: string): Promise<BlockResult[]> {
  const blocks = codeBlocks(mdx).filter((block) => block.lang === "python" || /^package main\b/m.test(block.source));
  const results: BlockResult[] = [];
  for (const block of blocks) {
    const dir = await mkdtemp(path.join(tmpdir(), "code-check-"));
    try {
      const detail = block.lang === "go" ? await checkGo(dir, block.source) : await checkPython(dir, block.source);
      results.push({ lang: block.lang, line: block.line, ok: detail === "", detail });
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  }
  return results;
}

function codeBlocks(mdx: string): Block[] {
  const lines = mdx.split("\n");
  const blocks: Block[] = [];
  for (let i = 0; i < lines.length; i++) {
    const lang = /^```(go|python)\s*$/.exec(lines[i] ?? "")?.[1] as Block["lang"] | undefined;
    if (lang === undefined) continue;
    const end = lines.findIndex((line, j) => j > i && /^```\s*$/.test(line));
    if (end === -1) break;
    blocks.push({ lang, line: i + 1, source: lines.slice(i + 1, end).join("\n") + "\n" });
    i = end;
  }
  return blocks;
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
