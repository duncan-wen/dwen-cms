/**
 * What `<ForgettingAnimation />` shows: one model's abilities before and after it learns the
 * company's product knowledge three ways. The numbers are illustrative, out of 100.
 */
export const ABILITIES = ["產品知識", "寫程式", "照格式回答", "拒絕危險問題"] as const;

/** Where each ability starts, in the order of `ABILITIES`. */
export const START = [20, 80, 85, 90];

export const METHODS = [
  { name: "全參數微調", after: [95, 40, 30, 15], note: "學多忘多" },
  { name: "LoRA", after: [65, 72, 76, 82], note: "學少忘少" },
  { name: "提示詞＋RAG", after: [75, 80, 85, 90], note: "不動模型" },
];

export const FORGETTING_CAPTION =
  "示意動畫：同一個模型用三種方法學公司的產品知識，數字只是示意。全參數微調學最多也忘最多；LoRA 學得少、忘得也少；提示詞加 RAG 不改模型，原本的能力都在。";
export const FORGETTING_STEPS = [
  "同一個模型原本會寫程式、照格式回答、拒絕危險問題，但不懂公司的產品。",
  "全參數微調：產品知識學得最多，其他三項能力大幅下降。",
  "LoRA：產品知識學得比較少，其他能力只掉一點。",
  "提示詞加 RAG：不改模型，查文件回答產品問題，其他能力不變。",
  "數字只是示意，不是實測。",
];
