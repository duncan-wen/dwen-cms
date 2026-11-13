/** What the job shifts animation shows, read by both the scene and the list screen readers get. */
export const JOB_SHIFTS_HEADERS = { old: "被淘汰的", new: "新崛起的" } as const;

export const JOB_SHIFTS = [
  { era: "工業革命", old: "手工織布工", new: "機械師、工廠技師" },
  { era: "電腦普及", old: "打字員、計算員", new: "程式設計師" },
  { era: "AI", old: "翻文件寫程式", new: "駕馭 AI 的人" },
] as const;

/** The smaller line under the last era. */
export const JOB_SHIFTS_EXAMPLE = "例：護理師轉職 AI 應用工程師";

export const JOB_SHIFTS_CAPTION = "示意動畫：三次技術轉變中消失與崛起的工作。";
