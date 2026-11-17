/** What `<OversellAnimation />` says, beside the picture: its caption and, for screen readers, its steps. */
export const OVERSELL_CAPTION = "示意動畫：3 家店各記一本 100 件的帳本，加起來賣出 300 件。";
export const OVERSELL_STEPS = [
  "1,000 人搶購，分流器輪流分給 3 家店。",
  "每家店各記一本 100 件的帳本，各自扣到 0。",
  "加起來賣出 300 件，實際只有 100 件。",
];

/** What `<CentralStockAnimation />` says, beside the picture. */
export const CENTRAL_STOCK_CAPTION =
  "示意動畫：庫存交給總倉後只賣出 100 件；總倉一倒，3 家店都活著，1,000 人卻全部買不到。";
export const CENTRAL_STOCK_STEPS = [
  "3 家店不記庫存，每次都先問總倉。",
  "總倉從 100 扣到 0，剛好賣出 100 件，其餘的人收到賣完了。",
  "總倉關掉後再來 1,000 人：3 家店都還在，但問不到庫存，1,000 人全部失敗。",
];
