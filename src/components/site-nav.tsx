"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

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
      <ThemeToggle />
    </nav>
  );
}
