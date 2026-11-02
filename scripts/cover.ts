// Draws one cover image candidate for a Post through the local Fooocus (docs/adr/0004).
//   pnpm cover <slug> --prompt "<the scene, in English>" --style "<Fooocus style>" [--seed <n>]
// Writes covers/<slug>-<n>.jpg with its settings in covers/<slug>-<n>.json, and rewrites
// covers/<slug>.html showing every candidate so far for the Owner. covers/ is gitignored:
// copy the chosen one to content/posts/<slug>/cover.jpg. FOOOCUS_URL overrides the address.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import {
  coverCandidateSheet,
  coverTask,
  finishedImagePath,
  nextCandidateNumber,
  type CoverCandidate,
  type FooocusConfig,
} from "../src/cover/cover-image";
import { contentDir } from "../src/content/site-content";

const fooocus = process.env.FOOOCUS_URL ?? "http://127.0.0.1:7865";
const outDir = "covers";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { prompt: { type: "string" }, style: { type: "string" }, seed: { type: "string" } },
});
const [slug] = positionals;
if (positionals.length !== 1 || !values.prompt || !values.style) {
  console.error('Usage: pnpm cover <slug> --prompt "<scene>" --style "<Fooocus style>" [--seed <n>]');
  process.exit(1);
}
if (!existsSync(path.join(contentDir, "posts", slug))) {
  console.error(`No Post folder at ${path.join(contentDir, "posts", slug)}: write the Post first`);
  process.exit(1);
}
const request = {
  prompt: values.prompt,
  style: values.style,
  seed: values.seed ? Number(values.seed) : Math.floor(Math.random() * 2 ** 31),
};

const config = (await fetch(`${fooocus}/config`)
  .then((response) => response.json())
  .catch(() => {
    console.error(`Fooocus isn't answering at ${fooocus}: start it, or leave the Post on its generated cover`);
    process.exit(1);
  })) as FooocusConfig;

/** One call through Gradio 3's queue: hand over the session, then the data, then await the result. */
function queued(fnIndex: number, data: unknown[], session: string): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(`${fooocus.replace(/^http/, "ws")}/queue/join`);
    socket.onmessage = (event) => {
      const message = JSON.parse(String(event.data));
      if (message.msg === "send_hash") socket.send(JSON.stringify({ fn_index: fnIndex, session_hash: session }));
      if (message.msg === "send_data")
        socket.send(JSON.stringify({ data, event_data: null, fn_index: fnIndex, session_hash: session }));
      if (message.msg === "process_completed") {
        socket.close();
        if (message.success) resolve(message.output.data);
        else reject(new Error(`Fooocus failed: ${JSON.stringify(message.output)}`));
      }
    };
    socket.onerror = () => reject(new Error(`Lost the connection to Fooocus at ${fooocus}`));
  });
}

const started = Date.now();
const task = coverTask(config, request);
const session = crypto.randomUUID();
await queued(task.createFn, task.createData, session);
const imagePath = finishedImagePath(config, task.runFn, await queued(task.runFn, [null], session));
const image = await fetch(`${fooocus}/file=${imagePath}`);
if (!image.ok) throw new Error(`Couldn't download ${imagePath} from Fooocus: ${image.status}`);

mkdirSync(outDir, { recursive: true });
const number = nextCandidateNumber(slug, readdirSync(outDir));
const file = `${slug}-${number}.jpg`;
writeFileSync(path.join(outDir, file), Buffer.from(await image.arrayBuffer()));
const candidate: CoverCandidate = { number, file, ...request };
writeFileSync(path.join(outDir, `${slug}-${number}.json`), JSON.stringify(candidate, null, 2));

const candidates = readdirSync(outDir)
  .filter((f) => new RegExp(`^${slug}-\\d+\\.json$`).test(f))
  .map((f) => JSON.parse(readFileSync(path.join(outDir, f), "utf8")) as CoverCandidate);
writeFileSync(path.join(outDir, `${slug}.html`), coverCandidateSheet(slug, candidates));

console.log(`Drew ${outDir}/${file} in ${Math.round((Date.now() - started) / 1000)}s (${request.style}, seed ${request.seed})`);
console.log(`Candidates: explorer.exe ${outDir}/${slug}.html`);
