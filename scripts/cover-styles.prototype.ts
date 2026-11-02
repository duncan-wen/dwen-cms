// PROTOTYPE, throwaway: which Fooocus styles make good Post covers?
// Draws every (post, style) pair below through the local Fooocus (Gradio 3.41 queue API)
// and writes covers-prototype/index.html, a contact sheet for the Owner to pick from.
//   pnpm tsx scripts/cover-styles.prototype.ts
import { mkdirSync, writeFileSync, existsSync } from "node:fs";

const FOOOCUS = "http://127.0.0.1:7865";
const OUT = "covers-prototype";
const NEGATIVE = "text, letters, words, typography, watermark, signature, logo, caption";

const POSTS = [
  {
    slug: "why-mdx-in-git",
    title: "為什麼這個網站的文章寫在 git 裡",
    seed: 20261101,
    prompt:
      "paper boats sailing down a calm river that splits into several branches and merges back into one stream, seen from above, morning light, peaceful",
  },
  {
    slug: "how-this-site-was-built",
    title: "創世紀：一天之內，我和 AI 怎麼蓋出這個網站",
    seed: 20261102,
    prompt:
      "a small house newly built on a hilltop at dawn, scaffolding still standing, a person and a small friendly robot resting side by side watching the sunrise",
  },
];

const STYLES = [
  "Fooocus V2",
  "Japanese Ink Drawing",
  "MRE Sumi E Detailed",
  "Artstyle Watercolor",
  "Papercraft Flat Papercut",
  "Papercraft Stacked Papercut",
  "SAI Isometric",
  "SAI Lowpoly",
  "Mk Ukiyo E",
  "Simple Vector Art",
  "Blueprint Schematic Drawing",
  "Misc Minimalist",
];

type Component = { id: number; type: string; props: { label?: string; elem_id?: string; value?: unknown } };
type Dependency = { inputs: number[]; outputs: number[] };
const config = (await (await fetch(`${FOOOCUS}/config`)).json()) as {
  components: Component[];
  dependencies: Dependency[];
};
const byId = new Map(config.components.map((c) => [c.id, c]));
const CREATE_TASK = 67; // 153 inputs -> the task state
const RUN_TASK = 68; // runs the task in the same session, yields the gallery

function inputsFor(prompt: string, style: string, seed: number): unknown[] {
  const overrides: Record<string, unknown> = {
    positive_prompt: prompt,
    "Negative Prompt": NEGATIVE,
    "Selected Styles": [style],
    Performance: "Lightning",
    "Aspect Ratios": '1216×832 <span style="color: grey;"> ∣ 19:13</span>',
    "Image Number": 1,
    "Output Format": "jpeg",
    Seed: String(seed),
  };
  return config.dependencies[CREATE_TASK].inputs.map((id) => {
    const c = byId.get(id)!;
    if (c.type === "state") return null;
    const label = c.props.label ?? c.props.elem_id ?? "";
    return label in overrides ? overrides[label] : (c.props.value ?? null);
  });
}

function call(fnIndex: number, data: unknown[], session: string): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${FOOOCUS.replace("http", "ws")}/queue/join`);
    ws.onmessage = (event) => {
      const msg = JSON.parse(String(event.data));
      if (msg.msg === "send_hash") ws.send(JSON.stringify({ fn_index: fnIndex, session_hash: session }));
      else if (msg.msg === "send_data")
        ws.send(JSON.stringify({ data, event_data: null, fn_index: fnIndex, session_hash: session }));
      else if (msg.msg === "process_completed") {
        ws.close();
        if (msg.success) resolve(msg.output.data);
        else reject(new Error(JSON.stringify(msg.output)));
      }
    };
    ws.onerror = () => reject(new Error(`WebSocket error on fn ${fnIndex}`));
  });
}

async function draw(prompt: string, style: string, seed: number, file: string): Promise<number> {
  const started = Date.now();
  const session = Math.random().toString(36).slice(2);
  await call(CREATE_TASK, inputsFor(prompt, style, seed), session);
  const output = await call(RUN_TASK, [null], session);
  const galleryIndex = config.dependencies[RUN_TASK].outputs.indexOf(9);
  const gallery = output[galleryIndex] as { value: { name: string }[] };
  const path = gallery.value.at(-1)!.name;
  const image = await fetch(`${FOOOCUS}/file=${path}`);
  writeFileSync(file, Buffer.from(await image.arrayBuffer()));
  return Math.round((Date.now() - started) / 1000);
}

mkdirSync(OUT, { recursive: true });
const seconds: Record<string, number> = {};
const only = process.argv[2]; // e.g. "Fooocus V2" to try one style first
for (const style of only ? [only] : STYLES) {
  for (const post of only ? POSTS.slice(0, 1) : POSTS) {
    const file = `${OUT}/${post.slug}--${style.replaceAll(" ", "-")}.jpg`;
    if (existsSync(file)) continue;
    seconds[file] = await draw(post.prompt, style, post.seed, file);
    console.log(`${seconds[file]}s  ${file}`);
  }
}

const rows = STYLES.map((style, i) => {
  const cells = POSTS.map((post) => {
    const name = `${post.slug}--${style.replaceAll(" ", "-")}.jpg`;
    return `<td><a href="${name}"><img src="${name}" loading="lazy"></a></td>`;
  }).join("");
  return `<tr><th>${i + 1}. ${style}</th>${cells}</tr>`;
}).join("\n");
writeFileSync(
  `${OUT}/index.html`,
  `<!doctype html><meta charset="utf-8"><title>Cover styles (PROTOTYPE)</title>
<style>body{font:14px system-ui;margin:16px;background:#f4f1ea}table{border-collapse:collapse}
th{text-align:left;padding:8px;vertical-align:middle;width:180px}td{padding:4px}img{width:480px;display:block}
p{max-width:980px}</style>
<h1>封面風格對照（原型）</h1>
<p>同一篇文章用同一個種子和畫面描述，只換 Fooocus 風格。Lightning、1216×832、反向提示詞：${NEGATIVE}</p>
${POSTS.map((p) => `<p><b>${p.title}</b>：${p.prompt}</p>`).join("")}
<table><tr><th></th>${POSTS.map((p) => `<th>${p.title}</th>`).join("")}</tr>
${rows}</table>`,
);
console.log(`Open: explorer.exe ${OUT}/index.html`);
