"use client";

// PROTOTYPE, throwaway: contour lines behind every page, to choose what moves them.
// Three variants switchable with ?variant=A|B|C (← →) and three line strengths with ?ink=1|2|3 (keys 1 2 3).
// Lives only on the prototype/contour-backdrop branch; the real one is rewritten from the spec.
import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { useReducedMotion } from "./use-reduced-motion";

const VARIANTS = [
  { key: "A", name: "隨時間慢動" },
  { key: "B", name: "跟著捲動" },
  { key: "C", name: "靜止" },
];
const INKS = [
  { key: "1", name: "淡" },
  { key: "2", name: "中" },
  { key: "3", name: "強調色" },
];

const WIDTH = 1600;
const HEIGHT = 1000;
const CONTOURS = 22;
const POINTS = 120;
const URL_CHANGED = "prototype-url-changed";

type Terrain = { cx: number; cy: number; waves: { amp: number; phase: number; drift: number; speed: number }[] };

/** The cover's terrain (src/cover/cover.ts), plus a speed per wave so it can move. */
function terrainFor(seed: string): Terrain {
  const random = seededRandom(hash(seed));
  const cx = WIDTH * (0.25 + random() * 0.5);
  const cy = HEIGHT * (0.3 + random() * 0.4);
  const waves = Array.from({ length: 4 }, (_, j) => ({
    amp: (0.22 / (j + 1)) * (0.6 + random()),
    phase: random() * 6.28,
    drift: (random() - 0.5) * 0.5,
    speed: (j % 2 === 0 ? 1 : -1) / (j + 1),
  }));
  return { cx, cy, waves };
}

function pathsAt({ cx, cy, waves }: Terrain, t: number): string[] {
  const step = (Math.hypot(WIDTH, HEIGHT) / CONTOURS) * 0.62;
  return Array.from({ length: CONTOURS }, (_, index) => {
    const k = index + 1;
    const points = Array.from({ length: POINTS }, (_, i) => {
      const a = (i / POINTS) * Math.PI * 2;
      const m = waves.reduce(
        (sum, w, j) => sum + w.amp * Math.sin((j + 2) * a + w.phase + k * w.drift + t * w.speed),
        1,
      );
      const r = k * step * m;
      return `${(cx + Math.cos(a) * r * 1.25).toFixed(1)} ${(cy + Math.sin(a) * r * 0.85).toFixed(1)}`;
    });
    return `M${points.join("L")}Z`;
  });
}

function hash(text: string): number {
  let h = 2166136261;
  for (const char of text) {
    h ^= char.codePointAt(0)!;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function subscribeToUrl(onChange: () => void) {
  window.addEventListener(URL_CHANGED, onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    window.removeEventListener(URL_CHANGED, onChange);
    window.removeEventListener("popstate", onChange);
  };
}

function setParam(name: string, value: string) {
  const url = new URL(window.location.href);
  url.searchParams.set(name, value);
  window.history.replaceState(null, "", url);
  window.dispatchEvent(new Event(URL_CHANGED));
}

export function ContourBackdropPrototype() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const search = useSyncExternalStore(
    subscribeToUrl,
    () => window.location.search,
    () => "",
  );
  const params = new URLSearchParams(search);
  const variant = VARIANTS.find(({ key }) => key === params.get("variant")) ?? VARIANTS[0];
  const ink = INKS.find(({ key }) => key === params.get("ink")) ?? INKS[0];
  // A Post has its own terrain, seeded by its Slug; every other page shares the site's.
  const seed = /^\/posts\/([^/]+)/.exec(pathname)?.[1] ?? "site";
  const svg = useRef<SVGSVGElement>(null);
  const still = variant.key === "C" || reducedMotion !== false;

  useEffect(() => {
    const paths = [...(svg.current?.querySelectorAll("path") ?? [])];
    const terrain = terrainFor(seed);
    const draw = (t: number) => pathsAt(terrain, t).forEach((d, i) => paths[i].setAttribute("d", d));
    draw(0);
    if (still) return;
    const wide = window.matchMedia("(min-width: 640px)");
    const start = performance.now();
    let t = 0;
    let frame = requestAnimationFrame(function tick(now) {
      frame = requestAnimationFrame(tick);
      // Phones show the lines still.
      if (!wide.matches || document.hidden) return;
      const target = variant.key === "A" ? ((now - start) / 1000) * 0.06 : window.scrollY / 500;
      const next = variant.key === "A" ? target : t + (target - t) * 0.08;
      if (Math.abs(next - t) < 0.0002) return;
      t = next;
      draw(t);
    });
    return () => cancelAnimationFrame(frame);
  }, [seed, still, variant.key]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof Element && event.target.closest("input, textarea, [contenteditable]")) return;
      const at = VARIANTS.indexOf(variant);
      if (event.key === "ArrowLeft") setParam("variant", VARIANTS[(at + VARIANTS.length - 1) % VARIANTS.length].key);
      if (event.key === "ArrowRight") setParam("variant", VARIANTS[(at + 1) % VARIANTS.length].key);
      if (INKS.some(({ key }) => key === event.key)) setParam("ink", event.key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [variant]);

  return (
    <>
      <svg
        ref={svg}
        aria-hidden="true"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
        className={`contour-backdrop contour-ink-${ink.key} pointer-events-none fixed inset-0 -z-10 h-full w-full`}
      >
        <g fill="none" stroke="currentColor" strokeLinejoin="round">
          {Array.from({ length: CONTOURS }, (_, index) => (
            <path
              key={index}
              vectorEffect="non-scaling-stroke"
              strokeWidth={(index + 1) % 5 === 0 ? 1.6 : 0.9}
              strokeOpacity={(index + 1) % 5 === 0 ? 0.85 : 0.5}
            />
          ))}
        </g>
      </svg>
      <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full bg-ink px-2 py-1.5 font-mono text-[13px] whitespace-nowrap text-paper shadow-lg">
        {VARIANTS.map(({ key, name }) => (
          <button
            key={key}
            type="button"
            onClick={() => setParam("variant", key)}
            className={`rounded-full px-3 py-1 ${key === variant.key ? "bg-paper text-ink" : ""}`}
          >
            {key} {name}
          </button>
        ))}
        <span className="px-1 opacity-50">|</span>
        {INKS.map(({ key, name }) => (
          <button
            key={key}
            type="button"
            onClick={() => setParam("ink", key)}
            className={`rounded-full px-3 py-1 ${key === ink.key ? "bg-paper text-ink" : ""}`}
          >
            {key} {name}
          </button>
        ))}
      </div>
    </>
  );
}
