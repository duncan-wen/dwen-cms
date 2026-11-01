// PROTOTYPE (throwaway, never merged): four promo-image (文宣圖) template variants for
// blog-v1/15, each at three social sizes, so the Owner can pick one.
//   pnpm tsx .scratch/blog-v1/prototype/promo/render.ts
// Writes test-results/promo-prototype/<variant>-<size>.png and index.html (contact sheet).
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import { generateCover } from "../../../../src/cover/cover";

const outDir = "test-results/promo-prototype";

// Sample content: a Post like the Owner's example article.
const post = {
  slug: "mattpocock-skills-workflow",
  title: "讓 AI 寫程式，也有工程流程",
  subtitle: "mattpocock/skills 完整工作流",
  date: "2026-11-01",
  points: ["先釐清需求，再寫成規格", "把規格拆成能平行做的票", "TDD 實作，兩軸 code review 收尾"],
  steps: [
    { name: "釐清需求", cmd: "/grilling" },
    { name: "寫成規格", cmd: "/to-spec" },
    { name: "拆成票", cmd: "/to-issues" },
    { name: "TDD 實作", cmd: "/tdd" },
    { name: "Code review", cmd: "/code-review" },
  ],
};

const sizes = [
  { key: "wide", w: 1200, h: 630, label: "1200×630 FB / LinkedIn / X" },
  { key: "square", w: 1080, h: 1080, label: "1080×1080 方形" },
  { key: "portrait", w: 1080, h: 1350, label: "1080×1350 IG 直式" },
] as const;

const variants = [
  { key: "A", name: "等高線封面", body: contourVariant },
  { key: "B", name: "直排標題", body: verticalVariant },
  { key: "C", name: "流程圖為主角", body: diagramVariant },
  { key: "D", name: "深色終端機", body: terminalVariant },
];

function contours(stroke: string) {
  const { width, height, contours } = generateCover(post.slug);
  const paths = contours
    .map(
      ({ d, heavy }) =>
        `<path d="${d}" stroke="${stroke}" stroke-opacity="${heavy ? 0.9 : 0.4}" stroke-width="${heavy ? 2.2 : 1.1}" vector-effect="non-scaling-stroke"/>`,
    )
    .join("");
  return `<svg class="contours" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid slice"><g fill="none">${paths}</g></svg>`;
}

// Titles break after the full-width comma, as an editor would set them by hand.
const titleHtml = () => post.title.replace("，", "，<br>");
// In 直排, short Latin runs sit upright in one cell.
const verticalTitleHtml = () =>
  post.title.replace(/[A-Za-z]{1,3}/g, (m) => `<span class="tcy">${m}</span>`).replace("，", "，<br>");

const pointsList = () => `<ul class="points">${post.points.map((p) => `<li>${p}</li>`).join("")}</ul>`;
const byline = () => `<div class="byline"><span class="name">Duncan Wen</span><span class="date">${post.date}</span></div>`;

function contourVariant() {
  return `${contours("#2c5a45")}
  <div class="panel">
    <p class="sub">${post.subtitle}</p>
    <h1>${titleHtml()}</h1>
    ${pointsList()}
    ${byline()}
  </div>`;
}

function verticalVariant() {
  return `<h1 class="vtitle">${verticalTitleHtml()}</h1>
  <div class="side">
    <p class="sub">${post.subtitle}</p>
    ${pointsList()}
    <div class="strip">${contours("#2c5a45")}</div>
    ${byline()}
  </div>`;
}

function diagramVariant() {
  const nodes = post.steps
    .map((s, i) => `<li class="node"><span class="n">${i + 1}</span><span class="nm">${s.name}</span><code>${s.cmd}</code></li>`)
    .join("");
  return `<header><p class="sub">${post.subtitle}</p><h1>${titleHtml()}</h1></header>
  <ol class="flow">${nodes}</ol>
  ${byline()}`;
}

function terminalVariant() {
  const lines = post.steps
    .map((s) => `<div class="ln"><span class="cmd">${s.cmd}</span><span class="cm"># ${s.name}</span></div>`)
    .join("");
  return `<header><h1>${titleHtml()}</h1><p class="sub">${post.subtitle}</p></header>
  <div class="term">
    <div class="ln"><span class="pr">$</span> <span class="fn">npx</span> skills@latest add <span class="st">mattpocock/skills</span></div>
    ${lines}
  </div>
  ${byline()}`;
}

const css = /* css */ `
:root {
  --paper:#f5f6f1; --paper-deep:#eceee6; --ink:#1b2420; --ink-soft:#57635c; --rule:#d9ddd3;
  --accent:#2c5a45; --accent-wash:#e1eae3;
}
* { box-sizing:border-box; margin:0; padding:0; }
body { background:#888; font-family:"Noto Sans TC",sans-serif; }
.frame { position:relative; overflow:hidden; background:var(--paper); color:var(--ink); margin:40px; }
h1 { font-family:"Noto Serif TC",serif; font-weight:900; letter-spacing:0.01em; line-height:1.25; }
.sub { font-family:"Noto Serif TC",serif; font-weight:700; color:var(--accent); }
.points { list-style:none; display:grid; gap:.55em; color:var(--ink-soft); font-weight:500; }
.points li { padding-left:1.1em; position:relative; }
.points li::before { content:""; position:absolute; left:0; top:.62em; width:.5em; height:2px; background:var(--accent); }
.byline { display:flex; gap:1.2em; align-items:baseline; font-family:"JetBrains Mono",monospace; color:var(--ink-soft); }
.byline .name { font-family:"Noto Serif TC",serif; font-weight:700; color:var(--ink); }
.contours { position:absolute; inset:0; width:100%; height:100%; }

/* A: contour cover full bleed, title on a paper panel */
.A { background:var(--paper-deep); }
.A .panel { position:absolute; background:var(--paper); display:flex; flex-direction:column; }
.A .panel .byline { margin-top:auto; }
.A.wide .panel { left:0; top:0; bottom:0; width:58%; padding:64px 56px; gap:20px; }
.A.wide h1 { font-size:58px; } .A.wide .sub { font-size:24px; } .A.wide .points { font-size:24px; } .A.wide .byline { font-size:20px; }
.A.square .panel, .A.portrait .panel { left:0; right:0; bottom:0; padding:64px 72px; gap:24px; }
.A.square .panel { height:56%; } .A.portrait .panel { height:52%; }
.A.square h1, .A.portrait h1 { font-size:72px; } .A.square .sub, .A.portrait .sub { font-size:30px; }
.A.square .points, .A.portrait .points { font-size:30px; } .A.square .byline, .A.portrait .byline { font-size:24px; }

/* B: vertical title, the home page's 直排 hero */
.B { display:flex; flex-direction:row-reverse; }
.B .vtitle { writing-mode:vertical-rl; text-orientation:mixed; border-left:2px solid var(--ink); }
.B .tcy { text-combine-upright:all; }
.B .side { flex:1; display:flex; flex-direction:column; gap:28px; }
.B .strip { position:relative; flex:1; min-height:80px; background:var(--paper-deep); }
.B.wide { padding:56px; gap:56px; } .B.wide .vtitle { font-size:62px; padding-left:40px; }
.B.wide .side { gap:22px; } .B.wide .sub { font-size:28px; } .B.wide .points { font-size:24px; } .B.wide .byline { font-size:20px; }
.B.square, .B.portrait { padding:80px; gap:72px; }
.B.square .vtitle { font-size:96px; padding-left:56px; } .B.portrait .vtitle { font-size:110px; padding-left:56px; }
.B.square .sub, .B.portrait .sub { font-size:36px; } .B.square .points, .B.portrait .points { font-size:29px; }
.B.square .byline, .B.portrait .byline { font-size:26px; }

/* C: the workflow diagram is the hero */
.C { display:flex; flex-direction:column; }
.C .flow { list-style:none; display:flex; flex:1; align-items:center; justify-content:center; }
.C .node { position:relative; display:flex; flex-direction:column; align-items:center; gap:.35em; background:var(--paper);
  border:2px solid var(--accent); border-radius:10px; padding:.7em .9em; }
.C .node:last-child { background:var(--accent); color:var(--paper); }
.C .node:last-child code, .C .node:last-child .n { color:var(--accent-wash); }
.C .n { font-family:"JetBrains Mono",monospace; color:var(--accent); font-size:.75em; }
.C .nm { font-family:"Noto Serif TC",serif; font-weight:700; white-space:nowrap; }
.C code { font-family:"JetBrains Mono",monospace; font-size:.68em; color:var(--ink-soft); }
.C .node + .node::before { content:""; position:absolute; background:var(--accent); }
.C.wide { padding:52px 56px 40px; } .C.wide h1 { font-size:54px; } .C.wide .sub { font-size:24px; margin-bottom:6px; }
.C.wide .flow { gap:34px; font-size:24px; } .C.wide .node + .node::before { left:-36px; width:34px; height:2px; top:50%; }
.C.wide .byline { font-size:20px; }
.C.square, .C.portrait { padding:80px 80px 64px; }
.C.square h1, .C.portrait h1 { font-size:76px; } .C.square .sub, .C.portrait .sub { font-size:32px; margin-bottom:10px; }
.C.square .flow, .C.portrait .flow { flex-direction:column; gap:30px; font-size:34px; }
.C.square .flow { gap:22px; font-size:30px; }
.C.square .node, .C.portrait .node { flex-direction:row; gap:.8em; width:72%; justify-content:flex-start; }
.C.square .node code, .C.portrait .node code { margin-left:auto; }
.C.square .node + .node::before, .C.portrait .node + .node::before { top:-32px; height:30px; width:2px; left:50%; }
.C.square .node + .node::before { top:-24px; height:22px; }
.C.square .byline, .C.portrait .byline { font-size:26px; }

/* D: dark tokens, the commands as a terminal */
.D { --paper:#121614; --paper-deep:#1a1f1c; --ink:#e1e5df; --ink-soft:#97a29b; --rule:#2b332f; --accent:#8fc3a6;
  background:var(--paper); display:flex; flex-direction:column; }
.D .term { background:var(--paper-deep); border:1px solid var(--rule); border-radius:12px; font-family:"JetBrains Mono",monospace;
  display:flex; flex-direction:column; gap:.55em; color:var(--ink); }
.D .ln { display:flex; gap:.8em; } .D .pr { color:var(--ink-soft); } .D .fn { color:#93bde6; } .D .st { color:#9ccf9f; }
.D .cmd { color:#e29bb8; min-width:9.5em; } .D .cm { color:#6c7771; font-family:"Noto Sans TC",sans-serif; }
.D .byline { }
.D.square .term, .D.portrait .term { margin:auto 0; }
.D.wide { padding:56px; gap:30px; } .D.wide h1 { font-size:56px; } .D.wide .sub { font-size:24px; margin-top:8px; }
.D.wide .term { font-size:21px; padding:24px 28px; } .D.wide .byline { font-size:20px; }
.D.square, .D.portrait { padding:80px; gap:48px; } .D.square h1, .D.portrait h1 { font-size:78px; }
.D.square .sub, .D.portrait .sub { font-size:32px; margin-top:12px; }
.D.square .term, .D.portrait .term { font-size:32px; padding:40px 48px; gap:.8em; }
.D.square .byline, .D.portrait .byline { font-size:26px; }
`;

const frames = variants
  .flatMap((v) =>
    sizes.map(
      (s) =>
        `<div class="frame ${v.key} ${s.key}" id="${v.key}-${s.key}" style="width:${s.w}px;height:${s.h}px">${v.body()}</div>`,
    ),
  )
  .join("\n");

const html = `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&family=Noto+Serif+TC:wght@700;900&family=JetBrains+Mono&display=block" rel="stylesheet">
<style>${css}</style></head><body>${frames}</body></html>`;

mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/templates.html`, html);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`file://${process.cwd()}/${outDir}/templates.html`);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);
for (const v of variants) {
  for (const s of sizes) {
    await page.locator(`#${v.key}-${s.key}`).screenshot({ path: `${outDir}/${v.key}-${s.key}.png` });
  }
}
await browser.close();

const sheet = variants
  .map(
    (v) => `<section><h2>${v.key}：${v.name}</h2><div class="row">${sizes
      .map((s) => `<figure><img src="${v.key}-${s.key}.png"><figcaption>${s.label}</figcaption></figure>`)
      .join("")}</div></section>`,
  )
  .join("");
writeFileSync(
  `${outDir}/index.html`,
  `<!doctype html><meta charset="utf-8"><title>文宣圖原型</title><style>
body{font-family:sans-serif;margin:24px;background:#ddd} h2{margin:32px 0 12px}
.row{display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap} figure{margin:0}
img{display:block;height:360px;box-shadow:0 1px 4px #0003} figcaption{font-size:13px;margin-top:6px}
</style><h1>文宣圖原型：選一個（或說要 A 的什麼加 C 的什麼）</h1>${sheet}`,
);
console.log(`Contact sheet: ${outDir}/index.html`);
