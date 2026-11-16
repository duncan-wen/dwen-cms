"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SITE_NAME } from "@/site-name";
import { Seal } from "./seal";
import { SiteNav } from "./site-nav";

/**
 * Every page's header: the seal and the site's name linking home, then the section links.
 * It sticks to the top of the window, its paper background only as wide as the reading column
 * so the Backdrop's margins stay whole. A marker at the top of the page tells it when the page
 * has scrolled (`data-scrolled`), and only then does a line show under it; at the top, and
 * without JavaScript, it looks as it would if it didn't stick. Its height when stuck is
 * `--header-height` in globals.css, which keeps anchors and the table of contents clear of it.
 */
export function SiteHeader() {
  const marker = useRef<HTMLSpanElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const element = marker.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <span ref={marker} aria-hidden className="pointer-events-none absolute top-0 h-px w-px" />
      <header
        data-scrolled={scrolled || undefined}
        className="sticky top-0 z-20 mx-auto flex w-full max-w-2xl flex-wrap items-center justify-between gap-x-6 gap-y-3 bg-paper max-sm:gap-x-4 px-4 pt-7 pb-3 data-scrolled:shadow-[0_1px_0_var(--color-rule)]"
      >
        <Link href="/" className="flex items-center gap-3 font-serif text-lg font-bold tracking-[0.02em]">
          <Seal className="motion-safe:animate-stamp" />
          {SITE_NAME}
        </Link>
        <SiteNav />
      </header>
    </>
  );
}
