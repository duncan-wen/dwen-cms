import { describe, expect, it } from "vitest";
import { dateValue, formatDate, isoDate, monthDay, year } from "./format-date";

describe("date formats", () => {
  it("gives the long Chinese date, the ISO date, MM-DD and the year", () => {
    expect(formatDate("2026-11-01")).toBe("2026年11月1日");
    expect(isoDate("2026-11-01")).toBe("2026-11-01");
    expect(monthDay("2026-11-01")).toBe("11-01");
    expect(year("2026-11-01")).toBe("2026");
  });

  it("gives the date as a Date at midnight UTC, for feeds", () => {
    expect(dateValue("2026-11-01").toISOString()).toBe("2026-11-01T00:00:00.000Z");
  });
});
