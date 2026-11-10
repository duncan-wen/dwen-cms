// Draws one cover image candidate for a Post through the local Fooocus (docs/adr/0004).
//   pnpm cover <slug> --prompt "<the scene, in English>" --style "<Fooocus style>" [--seed <n>]
// Writes covers/<slug>-<n>.jpg with its settings in covers/<slug>-<n>.json, and rewrites
// covers/<slug>.html showing every candidate so far for the Owner. covers/ is gitignored:
// copy the chosen one to content/posts/<slug>/cover.jpg. --seed redraws a candidate exactly;
// FOOOCUS_URL points at a Fooocus elsewhere.
//   pnpm cover --ping     only check that Fooocus answers, before the Post exists
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { ContentValidationError } from "../src/content/content";
import { getContent } from "../src/content/site-content";
import {
  candidateNumber,
  coverCandidateSheet,
  coverTask,
  finishedImagePath,
  nextCandidateNumber,
  type CoverCandidate,
  type FooocusConfig,
} from "../src/cover/cover-image";

const fooocusUrl = process.env.FOOOCUS_URL ?? "http://127.0.0.1:7865";
const outDir = "covers";
/** Longer than a cold start (loading the model took 73s once), short enough to notice a stuck queue. */
const drawTimeoutMs = 5 * 60_000;

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    prompt: { type: "string" },
    style: { type: "string" },
    seed: { type: "string" },
    ping: { type: "boolean" },
  },
});
const notAnswering = `Fooocus isn't answering at ${fooocusUrl}: start it, or leave the Post on its generated cover`;
if (values.ping) {
  const response = await fetch(`${fooocusUrl}/config`, { signal: AbortSignal.timeout(10_000) }).catch(() =>
    fail(notAnswering),
  );
  if (!response.ok) fail(`Something answers at ${fooocusUrl}, but not as Fooocus (${response.status})`);
  console.log(`Fooocus is answering at ${fooocusUrl}`);
  process.exit(0);
}
const [slug] = positionals;
if (positionals.length !== 1 || !values.prompt || !values.style)
  fail('Usage: pnpm cover <slug> --prompt "<scene>" --style "<Fooocus style>" [--seed <n>]');
if (values.seed !== undefined && !/^\d+$/.test(values.seed))
  fail(`--seed must be a whole number, not "${values.seed}"`);
const request = {
  prompt: values.prompt,
  style: values.style,
  seed: values.seed !== undefined ? Number(values.seed) : Math.floor(Math.random() * 2 ** 31),
};

const content = await getContent().catch((error: unknown) => {
  if (!(error instanceof ContentValidationError)) throw error;
  fail(error.message);
});
if (content.resolveSlug(slug).kind !== "post") fail(`No Post has the Slug "${slug}": write the Post first`);

const config = (await fetch(`${fooocusUrl}/config`)
  .then((response) => response.json())
  .catch(() => fail(notAnswering))) as FooocusConfig;

/** One call through Gradio 3's queue: hand over the session, then the data, then await the result. */
function gradioQueueCall(fnIndex: number, data: unknown[], session: string): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(`${fooocusUrl.replace(/^http/, "ws")}/queue/join`);
    const timer = setTimeout(() => {
      socket.close();
      reject(new Error(`Fooocus didn't finish within ${drawTimeoutMs / 60_000} minutes`));
    }, drawTimeoutMs);
    let completed = false;
    socket.onmessage = (event) => {
      const message = JSON.parse(String(event.data));
      if (message.msg === "send_hash") socket.send(JSON.stringify({ fn_index: fnIndex, session_hash: session }));
      if (message.msg === "send_data")
        socket.send(JSON.stringify({ data, event_data: null, fn_index: fnIndex, session_hash: session }));
      if (message.msg === "process_completed") {
        completed = true;
        clearTimeout(timer);
        socket.close();
        if (message.success) resolve(message.output.data);
        else reject(new Error(`Fooocus failed: ${JSON.stringify(message.output)}`));
      }
    };
    socket.onclose = () => {
      clearTimeout(timer);
      if (!completed) reject(new Error(`Fooocus at ${fooocusUrl} closed the connection before finishing`));
    };
  });
}

async function draw(): Promise<ArrayBuffer> {
  const task = coverTask(config, request);
  const session = crypto.randomUUID();
  await gradioQueueCall(task.createFnIndex, task.createData, session);
  const output = await gradioQueueCall(task.runFnIndex, [null], session);
  const imagePath = finishedImagePath(config, task.runFnIndex, output);
  const image = await fetch(`${fooocusUrl}/file=${imagePath}`);
  if (!image.ok) throw new Error(`Couldn't download ${imagePath} from Fooocus: ${image.status}`);
  return image.arrayBuffer();
}

const started = Date.now();
const image = await draw().catch((error: unknown) => fail(error instanceof Error ? error.message : String(error)));

mkdirSync(outDir, { recursive: true });
const number = nextCandidateNumber(slug, readdirSync(outDir));
const file = `${slug}-${number}.jpg`;
writeFileSync(path.join(outDir, file), Buffer.from(image));
const candidate: CoverCandidate = { number, file, ...request };
writeFileSync(path.join(outDir, `${slug}-${number}.json`), JSON.stringify(candidate, null, 2));

const candidates = readdirSync(outDir)
  .filter((f) => candidateNumber(slug, "json", f) !== undefined)
  .map((f) => JSON.parse(readFileSync(path.join(outDir, f), "utf8")) as CoverCandidate);
writeFileSync(path.join(outDir, `${slug}.html`), coverCandidateSheet(slug, candidates));

console.log(
  `Drew ${outDir}/${file} in ${Math.round((Date.now() - started) / 1000)}s (${request.style}, seed ${request.seed})`,
);
console.log(`Candidates: explorer.exe ${outDir}/${slug}.html`);
