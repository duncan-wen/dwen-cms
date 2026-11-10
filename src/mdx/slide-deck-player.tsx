"use client";

import Image from "next/image";
import { useState } from "react";
import type { SlideDeckSource } from "./compile-mdx";

type Props = { deck: SlideDeckSource };

const arrowClass =
  "rounded px-2 py-1 hover:bg-accent-wash hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent";

/**
 * A Slide deck's player: the current slide, whose left third turns back and the rest forward,
 * a progress bar, and ← 3 / 15 → under it beside the download link. Only the first slide loads
 * with the page; turning, or the pointer or focus reaching the player, fetches the previous
 * slide and the next two, so a slide is there before the Reader turns to it.
 */
export function SlideDeckPlayer({ deck }: Props) {
  const [index, setIndex] = useState(0);
  const count = deck.slides.length;
  const slide = deck.slides[index];

  const preload = (around: number) => {
    for (const near of [around - 1, around + 1, around + 2]) {
      if (near >= 0 && near < count) new window.Image().src = deck.slides[near].src;
    }
  };
  const go = (to: number) => {
    const next = Math.max(0, Math.min(count - 1, to));
    setIndex(next);
    preload(next);
  };

  return (
    <figure
      aria-label="投影片"
      className="not-prose my-8"
      onPointerEnter={() => preload(index)}
      onFocus={() => preload(index)}
    >
      <div className="relative overflow-hidden rounded-md border border-rule bg-paper-deep">
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
    </figure>
  );
}
