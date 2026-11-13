import { describe, expect, it } from "vitest";
import { canRefreshThreadsToken, tokenStatus } from "./share-token";

const on = (date: string) => new Date(`${date}T12:00:00Z`);

describe("tokenStatus", () => {
  it("is ok until ten days before expiry, then warns, then expires", () => {
    expect(tokenStatus("2026-11-01", on("2026-12-20"), 60)).toEqual({ state: "ok", daysLeft: 11 });
    expect(tokenStatus("2026-11-01", on("2026-12-21"), 60)).toEqual({ state: "warn", daysLeft: 10 });
    expect(tokenStatus("2026-11-01", on("2026-12-31"), 60)).toEqual({ state: "expired", daysLeft: 0 });
  });
});

describe("canRefreshThreadsToken", () => {
  it("refreshes a token at least a day old that hasn't expired", () => {
    expect(canRefreshThreadsToken("2026-11-13", on("2026-11-13"), 60)).toBe(false);
    expect(canRefreshThreadsToken("2026-11-13", on("2026-11-14"), 60)).toBe(true);
    expect(canRefreshThreadsToken("2026-11-13", on("2027-01-12"), 60)).toBe(false);
  });
});
