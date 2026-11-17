import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

/** Where `pnpm shots` keeps last run's hashes: outside `test-results/`, which `pnpm smoke` empties. */
export const SHOT_MEMORY_FILE = ".shots-cache/last.json";

/**
 * Each shot's sha256 from the last `pnpm shots` run, by file name, so a reshoot can say which
 * shots came out byte for byte the same and need no second read.
 */
export class ShotMemory {
  private readonly current: Record<string, string> = {};

  private constructor(
    private readonly file: string,
    private readonly previous: Record<string, string>,
  ) {}

  /** Last run's hashes from `file`; none when it is missing or unreadable. */
  static load(file: string = SHOT_MEMORY_FILE): ShotMemory {
    let previous: Record<string, string> = {};
    try {
      const parsed: unknown = JSON.parse(readFileSync(file, "utf8"));
      if (parsed && typeof parsed === "object") previous = parsed as Record<string, string>;
    } catch {
      // A first run, or a memory file that can't be read: nothing is unchanged.
    }
    return new ShotMemory(file, previous);
  }

  /** Records this run's shot and says whether last run wrote the same bytes under the same name. */
  record(name: string, bytes: Buffer): boolean {
    const hash = createHash("sha256").update(bytes).digest("hex");
    this.current[name] = hash;
    return this.previous[name] === hash;
  }

  /** Replaces the memory file with this run's hashes. */
  save(): void {
    mkdirSync(path.dirname(this.file), { recursive: true });
    writeFileSync(this.file, `${JSON.stringify(this.current, null, 2)}\n`);
  }
}
