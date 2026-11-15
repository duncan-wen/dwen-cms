import { describe, expect, it } from "vitest";
import { dropWhenOptedOut, isOptedOut, type OptOutStorage, setOptedOut } from "./analytics-opt-out";

const pageview = { type: "pageview", url: "https://dwen.example/posts/smoke-post" } as const;

function memoryStorage(): OptOutStorage {
  const items = new Map<string, string>();
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
    removeItem: (key) => void items.delete(key),
  };
}

const brokenStorage = (): OptOutStorage => {
  throw new Error("storage is blocked");
};

describe("the Analytics opt-out", () => {
  it("sends the event from a browser that hasn't opted out", () => {
    const storage = memoryStorage();

    expect(dropWhenOptedOut(pageview, () => storage)).toBe(pageview);
  });

  it("drops the event from a browser that has opted out", () => {
    const storage = memoryStorage();
    setOptedOut(true, () => storage);

    expect(isOptedOut(() => storage)).toBe(true);
    expect(dropWhenOptedOut(pageview, () => storage)).toBeNull();
  });

  it("sends the event again once the opt-out is cleared", () => {
    const storage = memoryStorage();
    setOptedOut(true, () => storage);
    setOptedOut(false, () => storage);

    expect(dropWhenOptedOut(pageview, () => storage)).toBe(pageview);
  });

  it("counts storage that can't be read as not opted out, and reports a write it refused", () => {
    expect(dropWhenOptedOut(pageview, brokenStorage)).toBe(pageview);
    expect(setOptedOut(true, brokenStorage)).toBe(false);
  });
});
