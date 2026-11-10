"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { THUMB_WIDTH } from "@/deck/deck-names";
import type { SlideDeckSource } from "./compile-mdx";

type Props = { deck: SlideDeckSource };

const arrowClass =
  "rounded px-2 py-1 hover:bg-accent-wash hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent";

/**
 * The slide a key turns to from `index`, or nothing for a key the player leaves alone. A key
 * typed into a text box is never the player's, and Space on a button or fold presses it.
 */
function turnFor(event: KeyboardEvent, index: number, count: number): number | undefined {
  if (event.altKey || event.ctrlKey || event.metaKey) return undefined;
  const target = event.target instanceof Element ? event.target : null;
  if (target?.closest("input, textarea, select, [contenteditable]")) return undefined;
  if (event.key === " " && target?.closest("button, a, summary")) return undefined;
  const turns: Record<string, number> = {
    ArrowRight: index + 1,
    ArrowLeft: index - 1,
    " ": index + 1,
    PageDown: index + 1,
    PageUp: index - 1,
    Home: 0,
    End: count - 1,
  };
  return turns[event.key];
}

/** The slide `#slide-N` names, counted from 0, or nothing when the hash names no slide of `count`. */
function slideInHash(hash: string, count: number): number | undefined {
  const n = Number(/^#slide-([1-9]\d*)$/.exec(hash)?.[1]);
  return n <= count ? n - 1 : undefined;
}

/**
 * The address holds the current slide: turning writes `#slide-N` in place, without a history
 * entry, so a link copied from the address opens on that slide. Writing the address fires no
 * event, so turning tells the player itself.
 */
const turnListeners = new Set<() => void>();
function subscribeToSlideHash(onChange: () => void) {
  turnListeners.add(onChange);
  window.addEventListener("hashchange", onChange);
  return () => {
    turnListeners.delete(onChange);
    window.removeEventListener("hashchange", onChange);
  };
}
function showSlideInHash(index: number) {
  window.history.replaceState(null, "", `#slide-${index + 1}`);
  for (const listener of turnListeners) listener();
}

const summaryClass = "w-fit cursor-pointer rounded px-2 py-1 text-ink-soft hover:bg-accent-wash hover:text-ink";

/** How far, in CSS pixels, a finger moves sideways across the slide before it counts as a swipe. */
const SWIPE_PX = 40;

/**
 * A Slide deck's player: the current slide, whose left third turns back and the rest forward,
 * a progress bar, and ← 3 / 15 → under it beside the download link. Keys turn slides while the
 * pointer is over the player or it has focus, a finger turns them by swiping, and the address
 * names the current slide (`#slide-3`). Only the first slide loads with the page; turning, or
 * the pointer or focus reaching the player, fetches the previous slide and the next two, so a
 * slide is there before the Reader turns to it.
 */
export function SlideDeckPlayer({ deck }: Props) {
  const count = deck.slides.length;
  // The page is drawn on slide 1; the address's slide takes over once it reaches the browser.
  const index = useSyncExternalStore(
    subscribeToSlideHash,
    () => slideInHash(window.location.hash, count) ?? 0,
    () => 0,
  );
  const slide = deck.slides[index];

  const preload = (around: number) => {
    for (const near of [around - 1, around + 1, around + 2]) {
      if (near >= 0 && near < count) new window.Image().src = deck.slides[near].src;
    }
  };
  const go = (to: number) => {
    const next = Math.max(0, Math.min(count - 1, to));
    showSlideInHash(next);
    preload(next);
  };

  // A link to a slide brings the player into view, on load and when followed within the page.
  const frame = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const reveal = () => {
      if (slideInHash(window.location.hash, count) !== undefined) frame.current?.scrollIntoView({ block: "center" });
    };
    reveal();
    window.addEventListener("hashchange", reveal);
    return () => window.removeEventListener("hashchange", reveal);
  }, [count]);

  // Keys are the player's only while the pointer is over it or focus is inside it.
  const player = useRef<HTMLElement>(null);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!player.current?.matches(":hover, :focus-within")) return;
      const to = turnFor(event, index, count);
      if (to === undefined) return;
      event.preventDefault();
      go(to);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const swipeFrom = useRef<number | null>(null);
  const [thumbnailsOpened, setThumbnailsOpened] = useState(false);

  return (
    <figure
      ref={player}
      aria-label="投影片"
      className="not-prose my-8"
      onPointerEnter={() => preload(index)}
      onFocus={() => preload(index)}
    >
      <div
        ref={frame}
        role="group"
        aria-roledescription="投影片"
        aria-label={`投影片 ${index + 1} / ${count}：${slide.title}`}
        tabIndex={0}
        onTouchStart={(event) => {
          swipeFrom.current = event.touches[0].clientX;
          preload(index);
        }}
        onTouchEnd={(event) => {
          if (swipeFrom.current === null) return;
          const moved = event.changedTouches[0].clientX - swipeFrom.current;
          swipeFrom.current = null;
          if (Math.abs(moved) > SWIPE_PX) go(index + (moved < 0 ? 1 : -1));
        }}
        className="relative touch-pan-y overflow-hidden rounded-md border border-rule bg-paper-deep outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Image
          unoptimized
          src={slide.src}
          alt={`${slide.title}。${slide.text}`}
          width={deck.width}
          height={deck.height}
          loading="eager"
          draggable={false}
          className="block h-auto w-full select-none dark:brightness-[.85]"
        />
        {/* Click zones for the pointer; the arrows below do the same for the keyboard and screen readers. */}
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          data-zone="back"
          onClick={() => go(index - 1)}
          className="absolute inset-y-0 left-0 w-1/3 cursor-w-resize"
        />
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          data-zone="forward"
          onClick={() => go(index + 1)}
          className="absolute inset-y-0 right-0 w-2/3 cursor-e-resize"
        />
        <div className="absolute inset-x-0 bottom-0 h-1 bg-rule">
          <div className="h-full bg-accent transition-[width]" style={{ width: `${((index + 1) / count) * 100}%` }} />
        </div>
      </div>
      <figcaption className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
        <span className="flex items-center gap-1">
          <button
            type="button"
            aria-label="上一頁"
            disabled={index === 0}
            onClick={() => go(index - 1)}
            className={arrowClass}
          >
            ←
          </button>
          <span aria-live="polite" className="font-mono tabular-nums">
            {index + 1} / {count}
          </span>
          <button
            type="button"
            aria-label="下一頁"
            disabled={index === count - 1}
            onClick={() => go(index + 1)}
            className={arrowClass}
          >
            →
          </button>
        </span>
        <span className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-1">
          <a href={deck.pdf.src} download className="rounded px-2 py-1 hover:bg-accent-wash hover:text-ink">
            下載 PDF（{deck.pdf.size}）
          </a>
          <span className="text-[13px]">由 NotebookLM 產生</span>
        </span>
      </figcaption>
      <details className="mt-3 text-sm" onToggle={(event) => setThumbnailsOpened(event.currentTarget.open)}>
        <summary className={summaryClass}>所有頁面</summary>
        {/* Drawn only once opened, so a Reader who never opens it never downloads a thumbnail. */}
        {thumbnailsOpened && (
          <ul aria-label="所有頁面" className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {deck.slides.map((each, at) => (
              <li key={each.thumb}>
                <button
                  type="button"
                  aria-label={`第 ${at + 1} 頁：${each.title}`}
                  aria-current={at === index ? "true" : undefined}
                  onClick={() => go(at)}
                  className={`block w-full overflow-hidden rounded border-2 ${at === index ? "border-accent" : "border-rule opacity-70 hover:opacity-100"}`}
                >
                  <Image
                    unoptimized
                    src={each.thumb}
                    alt=""
                    width={THUMB_WIDTH}
                    height={Math.round((THUMB_WIDTH * deck.height) / deck.width)}
                    draggable={false}
                    className="block h-auto w-full dark:brightness-[.85]"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </details>
      <details className="mt-2 text-sm">
        <summary className={summaryClass}>本頁文字</summary>
        <p className="mt-2 font-bold text-ink">{slide.title}</p>
        <p className="mt-1 leading-relaxed text-ink-soft">{slide.text}</p>
      </details>
    </figure>
  );
}
