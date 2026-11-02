/**
 * Cover images drawn by the local Fooocus (docs/adr/0004). Pure: it turns Fooocus's
 * Gradio 3 `/config` and a request into the calls to make, reads the drawn image's path
 * back out, and lays out the candidate sheet. `scripts/cover.ts` does the network and files.
 */
import { escapeHtml } from "../escape-html";

type Component = {
  id: number;
  type: string;
  props: { label?: string; elem_id?: string; value?: unknown; choices?: unknown[] };
};
type Dependency = { inputs: number[]; outputs: number[]; trigger_after?: number | null };

/** The parts of Fooocus's Gradio `/config` a cover needs. */
export type FooocusConfig = { components: Component[]; dependencies: Dependency[] };

/** One cover to draw: the scene in English, a Fooocus style name and a seed. */
export type CoverRequest = { prompt: string; style: string; seed: number };

/** One drawn candidate, as the sheet shows it. */
export type CoverCandidate = CoverRequest & { number: number; file: string };

/** What every cover leaves out: SDXL can't draw text, so a cover carries none. */
export const COVER_NEGATIVE_PROMPT =
  "text, letters, words, typography, caption, watermark, signature, logo";

/** A cover's size: 19:13, the closest SDXL size to the site's cover and OG crops. */
const COVER_ASPECT = "1216×832";

/**
 * The two queued calls that draw one cover: `createFnIndex` takes every setting and stores the
 * task in the session's state, then `runFnIndex`, in the same session, draws it.
 */
export function coverTask(config: FooocusConfig, request: CoverRequest) {
  const byId = new Map(config.components.map((c) => [c.id, c]));
  const isState = (id: number) => byId.get(id)?.type === "state";
  const createFnIndex = config.dependencies.reduce(
    (best, dep, i) =>
      dep.outputs.length === 1 && isState(dep.outputs[0]) && dep.inputs.length > (config.dependencies[best]?.inputs.length ?? -1)
        ? i
        : best,
    -1,
  );
  const runFnIndex = config.dependencies.findIndex((dep) => dep.trigger_after === createFnIndex);
  if (createFnIndex < 0 || runFnIndex < 0) throw new Error("Fooocus's Generate handlers weren't found in its /config");

  const name = (c: Component) => c.props.label ?? c.props.elem_id ?? "";
  const aspect = (c: Component) =>
    c.props.choices
      ?.map((choice) => (Array.isArray(choice) ? choice[0] : choice))
      .find((choice): choice is string => typeof choice === "string" && choice.startsWith(COVER_ASPECT));
  const settings: Record<string, (c: Component) => unknown> = {
    positive_prompt: () => request.prompt,
    "Negative Prompt": () => COVER_NEGATIVE_PROMPT,
    "Selected Styles": () => [request.style],
    Performance: () => "Lightning",
    "Aspect Ratios": aspect,
    "Image Number": () => 1,
    "Output Format": () => "jpeg",
    Seed: () => String(request.seed),
  };

  const inputs = config.dependencies[createFnIndex].inputs.map((id) => byId.get(id)!);
  for (const setting of Object.keys(settings)) {
    const component = inputs.find((c) => name(c) === setting);
    if (!component || settings[setting](component) === undefined)
      throw new Error(`Fooocus's "${setting}" setting wasn't found; has Fooocus changed?`);
  }
  const createData = inputs.map((c) =>
    c.type === "state" ? null : name(c) in settings ? settings[name(c)](c) : (c.props.value ?? null),
  );
  return { createFnIndex, runFnIndex, createData };
}

/** The file path of the image `runFnIndex` drew: the last one in its output Gallery. */
export function finishedImagePath(config: FooocusConfig, runFnIndex: number, output: unknown[]): string {
  const galleryId = config.components.find((c) => c.props.label === "Gallery")?.id;
  const index = config.dependencies[runFnIndex].outputs.indexOf(galleryId ?? -1);
  const images = (output[index] as { value?: { name: string }[] } | null)?.value ?? [];
  const last = images.at(-1);
  if (!last) throw new Error("Fooocus finished with no image");
  return last.name;
}

/** The candidate number in `<slug>-<n>.<extension>`, or undefined for any other file. */
export function candidateNumber(slug: string, extension: "jpg" | "json", file: string): number | undefined {
  const match = /^(.+)-(\d+)\.(\w+)$/.exec(file);
  return match && match[1] === slug && match[3] === extension ? Number(match[2]) : undefined;
}

/** The number for a Post's next candidate, `<slug>-<n>.jpg`: one past its highest. */
export function nextCandidateNumber(slug: string, files: string[]): number {
  return Math.max(0, ...files.map((f) => candidateNumber(slug, "jpg", f) ?? 0)) + 1;
}

/** One page showing a Post's candidates, for the Owner to pick from. */
export function coverCandidateSheet(slug: string, candidates: CoverCandidate[]): string {
  const cards = [...candidates]
    .sort((a, b) => a.number - b.number)
    .map(
      (c) => `<figure><a href="${escapeHtml(c.file)}"><img src="${escapeHtml(c.file)}" alt=""></a>
<figcaption><b>${c.number}</b> · ${escapeHtml(c.style)} · seed ${c.seed}<br>${escapeHtml(c.prompt)}</figcaption></figure>`,
    )
    .join("\n");
  return `<!doctype html><meta charset="utf-8"><title>${escapeHtml(slug)} 封面候選</title>
<style>body{font:14px system-ui;margin:16px}
main{display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));gap:16px}
figure{margin:0}img{width:100%;display:block}figcaption{padding:6px 0}</style>
<h1>${escapeHtml(slug)} 封面候選</h1>
<main>${cards}</main>`;
}
