/** What `<AgentPartsAnimation />` says: the scene's labels, its caption and, for screen readers, its steps. */
export const AGENT_PARTS_LABELS = {
  question: "問：訂單 A 為什麼還沒出貨？",
  brain: "大腦",
  order: { tool: "查訂單", system: "公司 ERP", result: "卡在倉庫" },
  shipping: { tool: "查物流", system: "物流系統", result: "缺貨，週五補" },
  answer: "答：缺貨，預計週五出貨",
  bought: "買來的：每家都一樣",
  built: "自己做：只有你家有",
} as const;

export const AGENT_PARTS_CAPTION = "示意動畫：AI agent 回答一個問題，大腦是買來的，連到公司系統的手腳要自己做。";
export const AGENT_PARTS_STEPS = [
  "員工問：訂單 A 為什麼還沒出貨？",
  "大腦決定先查訂單，從公司 ERP 查到卡在倉庫。",
  "再查物流，從物流系統查到缺貨，週五補貨。",
  "大腦組成答案：缺貨，預計週五出貨。",
  "大腦是買來的，每家公司都一樣；連到公司系統的手腳要自己做，只有你家有。",
];
