"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  { href: "/posts", label: "文章" },
  { href: "/tags", label: "標籤" },
  { href: "/about", label: "關於" },
] as const;

/** The header's section links, marking the section the current page belongs to. */
export function SiteNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="主要" className="flex items-center gap-[22px] text-[15px]">
      {sections.map(({ href, label }) => {
        const current = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={current ? "page" : undefined}
            className={
              current
                ? "py-1 text-ink shadow-[inset_0_-2px_0_var(--color-accent)]"
                : "py-1 text-ink-soft hover:text-ink"
            }
          >
            {label}
          </Link>
        );
      })}
      {/* Reserved for blog-v1/09's theme toggle, sized so filling it moves nothing. */}
      <div data-theme-toggle-slot className="size-8 flex-none" />
    </nav>
  );
}
