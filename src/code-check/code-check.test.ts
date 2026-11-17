import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { checkCodeBlocks } from "./code-check";

const has = (command: string, versionArgs: string[]) => {
  try {
    execFileSync(command, versionArgs, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};

const fence = (lang: string, source: string) => `\`\`\`${lang}\n${source}\n\`\`\`\n`;
const goodGo = 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("hi")\n}';

describe.skipIf(!has("go", ["version"]))("checkCodeBlocks: Go", () => {
  it("passes a whole program that is formatted and vets clean, naming its line", async () => {
    const results = await checkCodeBlocks(`前言\n\n${fence("go", goodGo)}`);

    expect(results).toEqual([{ lang: "go", line: 3, ok: true, detail: "" }]);
  });

  it("fails a program go vet rejects", async () => {
    const source = 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Printf("%d\\n", "text")\n}';

    const [result] = await checkCodeBlocks(fence("go", source));

    expect(result).toMatchObject({ ok: false });
    expect(result?.detail).toContain("Printf");
  });

  it("fails a program that doesn't compile", async () => {
    const [result] = await checkCodeBlocks(fence("go", "package main\n\nfunc main() {\n\tundefinedThing()\n}"));

    expect(result).toMatchObject({ ok: false });
    expect(result?.detail).toContain("undefined");
  });

  it("fails a program gofmt would change", async () => {
    const [result] = await checkCodeBlocks(fence("go", "package main\n\nfunc main() {\n    println(1)\n}"));

    expect(result).toMatchObject({ ok: false });
    expect(result?.detail).toContain("gofmt");
  });

  it("skips a Go fragment", async () => {
    expect(await checkCodeBlocks(fence("go", "ch := make(chan int)"))).toEqual([]);
  });
});

describe.skipIf(!has("python3", ["--version"]))("checkCodeBlocks: Python", () => {
  it("passes valid Python and fails a syntax error", async () => {
    const body = `${fence("python", "print('hi')")}\n${fence("python", "def broken(:\n    pass")}`;

    const [good, bad] = await checkCodeBlocks(body);

    expect(good).toMatchObject({ lang: "python", line: 1, ok: true });
    expect(bad).toMatchObject({ lang: "python", line: 5, ok: false });
    expect(bad?.detail).toContain("SyntaxError");
  });
});

it("ignores blocks in other languages", async () => {
  expect(await checkCodeBlocks(`${fence("text", "anything")}${fence("bash", "echo hi")}`)).toEqual([]);
});
