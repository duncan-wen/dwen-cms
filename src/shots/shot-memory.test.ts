import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ShotMemory } from "./shot-memory";

const memoryFile = () => path.join(mkdtempSync(path.join(tmpdir(), "shot-memory-")), "last.json");

describe("ShotMemory", () => {
  it("marks nothing unchanged on a first run", () => {
    const memory = ShotMemory.load(memoryFile());

    expect(memory.record("a.png", Buffer.from("a"))).toBe(false);
  });

  it("marks a shot unchanged when the last run wrote the same bytes under the same name", () => {
    const file = memoryFile();
    const first = ShotMemory.load(file);
    first.record("a.png", Buffer.from("a"));
    first.record("b.png", Buffer.from("b"));
    first.save();

    const second = ShotMemory.load(file);

    expect(second.record("a.png", Buffer.from("a"))).toBe(true);
    expect(second.record("b.png", Buffer.from("changed"))).toBe(false);
    expect(second.record("c.png", Buffer.from("a"))).toBe(false);
  });

  it("remembers only the latest run", () => {
    const file = memoryFile();
    const first = ShotMemory.load(file);
    first.record("a.png", Buffer.from("a"));
    first.save();
    const second = ShotMemory.load(file);
    second.record("a.png", Buffer.from("new"));
    second.save();

    expect(ShotMemory.load(file).record("a.png", Buffer.from("a"))).toBe(false);
  });

  it("starts empty when the memory file is unreadable", () => {
    const memory = ShotMemory.load("/nonexistent/dir/last.json");

    expect(memory.record("a.png", Buffer.from("a"))).toBe(false);
  });
});
