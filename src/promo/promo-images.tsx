import type { CSSProperties, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Post, Promo, PromoTemplate } from "@/content/content";
import { isoDate } from "@/format-date";
import { type Colours, darkColours, lightColours } from "@/og/token-colours";
import { serifFont } from "@/og/serif-font";
import { SITE_NAME } from "@/site-name";
import { titleGlyphs } from "@/og/og-title";
import { CoverLines } from "./cover-lines";

/**
 * Promo images (文宣圖): a Post drawn at the main social sizes from one of three brand
 * templates, in the site's colour tokens and fonts, for a Writing Agent to attach to
 * the Draft PR. They leave out the 「溫」 seal on purpose (the Owner's call); the site,
 * favicon and OG images keep it. `scripts/promo.ts` screenshots them with Playwright.
 */

/** The sizes every Post gets: one image each. */
export const PROMO_SIZES = [
  { name: "1200x630", width: 1200, height: 630, shape: "wide", label: "1200×630 Facebook / LinkedIn / X" },
  { name: "1080x1080", width: 1080, height: 1080, shape: "square", label: "1080×1080 方形" },
  { name: "1080x1350", width: 1080, height: 1350, shape: "portrait", label: "1080×1350 Instagram 直式" },
] as const;

export type PromoSize = (typeof PROMO_SIZES)[number];

type PromoPost = Pick<Post, "slug" | "title" | "date" | "promo">;

/** The id of a Post's image at one size in the promo document. */
export function promoImageId(slug: string, size: PromoSize) {
  return `${slug}-${size.name}`;
}

/**
 * An HTML document holding every Post's image at every size, each an element with its
 * `promoImageId`. Fonts load from Google Fonts, so it needs network access, and its
 * text fits only after `fitPromoText` runs in the page.
 */
export async function promoDocument(posts: PromoPost[]): Promise<string> {
  const colours = { light: await lightColours(), dark: await darkColours() };
  const images = posts.flatMap((post) =>
    PROMO_SIZES.map((size) => <PromoImage key={promoImageId(post.slug, size)} post={post} size={size} colours={colours} />),
  );
  const serifText = posts.map(serifGlyphs).join("") + SITE_NAME;
  const fontFaces = await Promise.all(
    ([700, 900] as const).map(async (weight) => {
      const font = await serifFont(weight, serifText);
      const data = Buffer.from(font.data).toString("base64");
      return `@font-face { font-family: "${font.name}"; font-weight: ${weight}; src: url(data:font/ttf;base64,${data}); }`;
    }),
  );
  const templateCss = Object.values(TEMPLATES).map((template) => template.css);
  return `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
<link rel="stylesheet" href="${SANS_AND_MONO_FONTS}">
<style>${fontFaces.join("\n")}
${CSS}
${templateCss.join("\n")}</style></head>
<body>${renderToStaticMarkup(<>{images}</>)}</body></html>`;
}

/**
 * Shrinks each image's text until nothing overflows its box. A title line never
 * wraps, so a line too wide for the image shrinks the title until it fits. Then
 * anything else too wide (a long row of steps or a long command) shrinks all the
 * text; too tall shrinks the title first, down to 70%, then all the text, down to
 * 60%. Runs in the page, so it uses nothing from outside its own body, and no named
 * inner functions (tsx would wrap them in a helper the page lacks).
 */
export function fitPromoText() {
  for (const frame of document.querySelectorAll<HTMLElement>("[data-promo]")) {
    const heading = frame.querySelector<HTMLElement>("[data-title]")!;
    const boxes = [...frame.querySelectorAll<HTMLElement>("[data-fit]")];
    let title = 1;
    let all = 1;
    while (title > 0.1) {
      const titleWide = heading.scrollWidth > heading.clientWidth + 1;
      const wide = boxes.some((box) => box.scrollWidth > box.clientWidth + 1);
      const tall = boxes.some((box) => box.scrollHeight > box.clientHeight + 1);
      if (!titleWide && !wide && !tall) break;
      if (titleWide || (!wide && title > 0.7)) title -= 0.02;
      else if (all > 0.6) all -= 0.04;
      else break;
      frame.style.setProperty("--title-fit", String(title));
      frame.style.setProperty("--fit", String(all));
    }
  }
}

const SANS_AND_MONO_FONTS =
  "https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@500;700&family=JetBrains+Mono:wght@400;500&display=block";

/** The faces and stacks follow visual-design: serif headings, the system sans for text, mono for dates and code. */
const SERIF = `"Noto Serif TC", serif`;
const SANS = `-apple-system, BlinkMacSystemFont, "PingFang TC", "Microsoft JhengHei", "Noto Sans TC", sans-serif`;
const MONO = `"JetBrains Mono", ui-monospace, monospace`;

/** What a template draws beyond the title, points and byline every image shows. */
type Template<P extends Promo> = {
  /** The colour tokens it is drawn in. */
  theme: "light" | "dark";
  /** Drawn behind the text, filling the image. */
  backdrop?: (post: PromoPost) => ReactNode;
  /** Drawn after the points: the template's hero. */
  hero?: (promo: P) => ReactNode;
  /** Text it sets in the serif face besides the title, so the font subset holds its glyphs. */
  serifText?: (promo: P) => string;
  /** Its styles, scoped by `.template-<name>` or by the classes only it uses. */
  css: string;
};

/** Each template's parts, by name. */
const TEMPLATES: { [T in PromoTemplate]: Template<Extract<Promo, { template: T }>> } = {
  /* contour: the generated cover full bleed, the text on a paper panel beside it (wide) or below it. */
  contour: {
    theme: "light",
    backdrop: (post) => <CoverLines slug={post.slug} />,
    css: /* css */ `
.template-contour { background: var(--paper-deep); }
.template-contour .cover { position: absolute; inset: 0; width: 100%; height: 100%; }
.template-contour .content { background: var(--paper); }
.template-contour.wide .content { right: auto; width: 60%; padding: 64px 56px 48px; }
.template-contour.square .content { top: auto; height: 58%; padding: 64px 72px 56px; }
.template-contour.portrait .content { top: auto; height: 56%; padding: 72px 72px 64px; }
`,
  },
  /* flow: numbered steps as the hero, in a row (wide) or a column, the last one filled. */
  flow: {
    theme: "light",
    hero: (promo) => (
      <ol className="steps" data-fit="">
        {promo.steps.map((step, index) => (
          <li key={index} className="step">
            <span className="number">{index + 1}</span>
            <span className="name">{step.name}</span>
            {step.command && <code>{step.command}</code>}
          </li>
        ))}
      </ol>
    ),
    serifText: (promo) => promo.steps.map((step) => step.name).join(""),
    css: /* css */ `
.steps { list-style: none; display: flex; flex: 1; align-items: center; justify-content: center; gap: var(--gap); font-size: calc(var(--fit) * var(--step)); }
.step { position: relative; display: flex; flex-direction: column; align-items: center; gap: 0.35em; padding: 0.7em 0.9em; border: 2px solid var(--accent); border-radius: 10px; background: var(--paper); }
.step .number { font-family: ${MONO}; font-size: 0.75em; color: var(--accent); }
.step .name { font-family: ${SERIF}; font-weight: 700; white-space: nowrap; }
.step code { font-family: ${MONO}; font-size: 0.68em; color: var(--ink-soft); white-space: nowrap; }
.step:last-child { background: var(--accent); color: var(--on-accent); }
.step:last-child .number, .step:last-child code { color: var(--accent-wash); }
.step + .step::before { content: ""; position: absolute; background: var(--accent); }
/* A grid row, so a step without a command is as tall as the others. */
.wide .steps { display: grid; grid-auto-flow: column; align-content: center; justify-content: center; }
.wide .step { justify-content: center; }
.wide .step + .step::before { left: calc(-2px - var(--gap)); width: var(--gap); height: 2px; top: 50%; }
.square .steps, .portrait .steps { flex-direction: column; }
.square .step, .portrait .step { flex-direction: row; gap: 0.8em; width: 80%; }
.square .step code, .portrait .step code { margin-left: auto; }
.square .step + .step::before, .portrait .step + .step::before { top: calc(-2px - var(--gap)); height: var(--gap); width: 2px; left: 50%; }
`,
  },
  /* terminal: the dark tokens, the title over a terminal box of commands with comments. */
  terminal: {
    theme: "dark",
    hero: (promo) => (
      <div className="terminal" data-fit="">
        <div className="dots">
          <i />
          <i />
          <i />
        </div>
        <div className="lines">
          {promo.lines.map((line, index) => {
            const [program, ...args] = line.command.split(" ");
            return (
              <div key={index} className="line">
                <span className="prompt">$</span>
                <span className="command">
                  <span className="program">{program}</span>
                  {args.length > 0 && ` ${args.join(" ")}`}
                </span>
                <span className="comment">{line.comment && `# ${line.comment}`}</span>
              </div>
            );
          })}
        </div>
      </div>
    ),
    css: /* css */ `
.terminal {
  display: flex; flex-direction: column; gap: 0.5em; padding: 1em 1.3em 1.2em;
  background: var(--paper-deep); border: 1px solid var(--rule); border-radius: 12px;
  font-family: ${MONO}; font-weight: 400; font-size: calc(var(--fit) * var(--code)); line-height: 1.4;
}
.square .terminal, .portrait .terminal { margin: auto 0; }
.terminal .dots { display: flex; gap: 0.4em; margin-bottom: 0.3em; }
.terminal .dots i { width: 0.6em; height: 0.6em; border-radius: 50%; background: var(--rule); }
/* One grid for every line, so the commands and the comments each line up. */
.terminal .lines { display: grid; grid-template-columns: auto auto 1fr; gap: 0.6em 0.8em; }
.terminal .line { display: contents; }
.terminal .prompt { color: var(--ink-soft); }
/* Lines never wrap: too long a line shrinks the text instead. */
.terminal .command, .terminal .comment { white-space: nowrap; }
.terminal .program { color: var(--code-function); }
.terminal .comment { padding-left: 0.6em; color: var(--code-comment); font-family: ${SANS}; font-weight: 500; }
`,
  },
};

/** A template's parts, typed for its own Promo. */
function templateOf<T extends PromoTemplate>(name: T): Template<Extract<Promo, { template: T }>> {
  return TEMPLATES[name];
}

/** Every text the images set in the serif face: titles, and what the template adds. */
function serifGlyphs({ title, promo }: PromoPost) {
  return titleGlyphs({ title, promo }) + (templateOf(promo.template).serifText?.(promo) ?? "");
}

type Props = { post: PromoPost; size: PromoSize; colours: Record<Template<Promo>["theme"], Colours> };

/** One Post's image at one size, in the template its promo frontmatter picks. */
function PromoImage({ post, size, colours }: Props) {
  const { promo } = post;
  const template = templateOf(promo.template);
  const tokens = Object.fromEntries(
    Object.entries(colours[template.theme]).map(([name, value]) => [`--${name}`, value]),
  );
  const style = { width: size.width, height: size.height, ...tokens } as CSSProperties;

  return (
    <div
      className={`frame template-${promo.template} ${size.shape}`}
      id={promoImageId(post.slug, size)}
      data-promo=""
      style={style}
    >
      {template.backdrop?.(post)}
      <div className="content" data-fit="">
        {promo.titleLines ? (
          <h1 className="title" data-title="">
            {promo.titleLines.map((line, index) => (
              <span key={index} className="line">
                {line}
              </span>
            ))}
          </h1>
        ) : (
          <h1 className="title wraps" data-title="">
            {post.title}
          </h1>
        )}
        <ul className="points">
          {promo.points.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
        {template.hero?.(promo)}
        <div className="byline">
          <span className="name">{SITE_NAME}</span>
          <time>{isoDate(post.date)}</time>
        </div>
      </div>
    </div>
  );
}

/** Sizes are multiplied by --fit (all text) and --title-fit (the title), which fitPromoText lowers. */
const CSS = /* css */ `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { display: flex; flex-direction: column; align-items: flex-start; gap: 40px; padding: 40px; }
.frame {
  --fit: 1; --title-fit: 1;
  position: relative; flex: none; overflow: hidden;
  background: var(--paper); color: var(--ink);
  font-family: ${SANS}; font-weight: 500; -webkit-font-smoothing: antialiased;
}
.wide { --title: 56px; --text: 24px; --small: 20px; --step: 24px; --code: 21px; --gap: calc(var(--fit) * 34px); }
.square { --title: 76px; --text: 32px; --small: 26px; --step: 30px; --code: 28px; --gap: calc(var(--fit) * 22px); }
.portrait { --title: 80px; --text: 34px; --small: 26px; --step: 34px; --code: 30px; --gap: calc(var(--fit) * 30px); }

.content { position: absolute; inset: 0; display: flex; flex-direction: column; overflow: hidden; gap: calc(var(--fit) * 22px); }
.wide .content { padding: 52px 56px 40px; }
.square .content, .portrait .content { padding: 80px 80px 64px; gap: calc(var(--fit) * 30px); }

.title {
  font-family: ${SERIF}; font-weight: 900; line-height: 1.28; letter-spacing: 0.01em;
  font-size: calc(var(--title-fit) * var(--fit) * var(--title));
}
/* Each of the Post's title lines stays on one line; fitPromoText shrinks the title until they fit. */
.title .line { display: block; white-space: nowrap; }
/* A title without lines wraps, never mid-word. */
.title.wraps { line-break: strict; overflow-wrap: break-word; }
.points { list-style: none; display: flex; flex-direction: column; gap: 0.45em; color: var(--ink-soft); font-size: calc(var(--fit) * var(--text)); line-height: 1.45; }
.points li { position: relative; padding-left: 1.1em; }
.points li::before { content: ""; position: absolute; left: 0; top: 0.72em; width: 0.55em; height: 2px; background: var(--accent); }
.byline { display: flex; gap: 1.2em; align-items: baseline; margin-top: auto; color: var(--ink-soft); font-size: calc(var(--fit) * var(--small)); }
.byline .name { font-family: ${SERIF}; font-weight: 700; color: var(--ink); }
.byline time { font-family: ${MONO}; font-variant-numeric: tabular-nums; }
`;
