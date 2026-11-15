import { describe, expect, it } from "vitest";
import { keywordNodeId } from "./parse-mermaid";

describe("keywordNodeId", () => {
  it.each([
    ["style", "flowchart LR\n  a[設定圖] --> style[畫風圖]\n  style --> c[逐頁畫]"],
    ["end", "flowchart LR\n  a[開始] --> end"],
    ["flowchart", "flowchart LR\n  a[開始] --> flowchart[流程]"],
  ])("names %s when it is a node ID", async (keyword, source) => {
    expect(await keywordNodeId(source)).toBe(keyword);
  });

  it("names no keyword when the mistake is elsewhere", async () => {
    // Unquoted parentheses break the label; "style" inside it is only a word.
    expect(await keywordNodeId("flowchart LR\n  a[code style (PEP8)] --> b[y]")).toBeUndefined();
    // click parses as a node ID; the unclosed label is the mistake.
    expect(await keywordNodeId("flowchart LR\n  a[x] --> click[點擊]\n  b[未關閉 --> c")).toBeUndefined();
  });

  it("names no keyword in a diagram that isn't a flowchart", async () => {
    expect(await keywordNodeId("sequenceDiagram\n  A->>B: the end (done)\n  B->>")).toBeUndefined();
  });
});
