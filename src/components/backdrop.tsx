"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { backdropLines, backdropSeed, type BackdropStrength } from "@/backdrop/backdrop";
import { type ContourLines, generateCover } from "@/cover/cover";
import { useReducedMotion } from "./use-reduced-motion";

type Props = {
  /** How strongly the lines are drawn; `off` draws nothing. */
  strength: BackdropStrength;
};

/** How far the Reader scrolls, in px, for the phase to grow by one. */
const SCROLL_PX_PER_PHASE = 500;
/** How much of the way to the scroll position's phase each frame covers, so the lines ease after the page. */
const EASE = 0.08;
/** Closer than this to its target, the phase lands on it and the frames stop. */
const SETTLED = 0.001;
/**
 * The Backdrop: the page's contour lines, behind everything. The lines are in the HTML at rest.
 * On a wide screen they fill the window and follow the scroll position, still whenever the
 * Reader is; on a narrow one, and for a Reader who asked for reduced motion, they never move.
 * `.backdrop` in globals.css says what counts as wide, where the lines show (the margins, never
 * behind the reading column) and their colour.
 */
export function Backdrop({ strength }: Props) {
  const seed = backdropSeed(usePathname());
  const reducedMotion = useReducedMotion();
  const svg = useRef<SVGSVGElement>(null);
  const atRest = backdropLines(strength, seed, 0);

  useEffect(() => {
    const element = svg.current;
    const rest = backdropLines(strength, seed, 0);
    if (reducedMotion !== false || !element || !rest) return;
    const paths = [...element.querySelectorAll("path")];
    const draw = (lines: ContourLines) => lines.contours.forEach(({ d }, i) => paths[i].setAttribute("d", d));
    // globals.css fixes the Backdrop to the window only where it has margins to show in; only there does it move.
    const fillsWindow = () => getComputedStyle(element).position === "fixed";
    let moves = fillsWindow();
    let phase = 0;
    let frame = 0;

    const step = () => {
      const target = moves ? window.scrollY / SCROLL_PX_PER_PHASE : 0;
      const next = phase + (target - phase) * EASE;
      const settled = Math.abs(target - next) < SETTLED;
      if (phase !== target) {
        phase = settled ? target : next;
        draw(generateCover(seed, phase));
      }
      frame = settled ? 0 : requestAnimationFrame(step);
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(step);
    };
    const onResize = () => {
      moves = fillsWindow();
      wake();
    };

    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", onResize);
    // A page opened already scrolled (a heading link, the back button) starts from there.
    wake();
    return () => {
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frame);
      // Back to the lines React rendered, so a Reader who turns reduced motion on gets them at rest.
      draw(rest);
    };
  }, [strength, seed, reducedMotion]);

  if (!atRest) return null;
  return (
    <svg
      // A new seed is a new terrain, drawn from rest.
      key={seed}
      ref={svg}
      aria-hidden="true"
      data-strength={strength}
      viewBox={`0 0 ${atRest.width} ${atRest.height}`}
      preserveAspectRatio="xMidYMid slice"
      className="backdrop pointer-events-none inset-0 -z-10 h-full w-full print:hidden"
    >
      <g fill="none" stroke="currentColor" strokeLinejoin="round">
        {atRest.contours.map(({ d, heavy }, index) => (
          <path
            key={index}
            d={d}
            strokeOpacity={heavy ? 0.85 : 0.5}
            strokeWidth={heavy ? 1.6 : 0.9}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
    </svg>
  );
}
