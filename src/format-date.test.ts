import { describe, expect, it } from "vitest";
import { dateValue, formatDate, isoDate, lastUpdated, monthDay, year } from "./format-date";

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

describe("lastUpdated", () => {
  it("is the latest Revision's date, else the publication date", () => {
    expect(lastUpdated({ date: "2026-10-01", latestRevision: { date: "2026-10-15" } })).toBe("2026-10-15");
    expect(lastUpdated({ date: "2026-10-01", latestRevision: undefined })).toBe("2026-10-01");
  });
});
