import { afterEach, expect, test, vi } from "vitest";
import { serifFont } from "./serif-font";

afterEach(() => {
  vi.unstubAllGlobals();
});

test("cuts a TrueType subset of the committed face without reaching the network", async () => {
  vi.stubGlobal("fetch", () => Promise.reject(new TypeError("fetch failed")));

  const font = await serifFont(700, "溫宏裕");

  expect([...new Uint8Array(font.data, 0, 4)]).toEqual([0, 1, 0, 0]); // the TrueType signature
  expect(font.data.byteLength).toBeLessThan(20_000);
});
