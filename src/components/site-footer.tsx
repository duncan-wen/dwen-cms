import { Seal } from "./seal";

const links = [
  { href: "https://github.com/duncan-wen", label: "GitHub" },
  { href: "mailto:lumpa7223@gmail.com", label: "lumpa7223@gmail.com" },
  { href: "https://www.linkedin.com/in/duncan-wen", label: "LinkedIn" },
  { href: "/feed.xml", label: "RSS" },
] as const;

/** Every page's footer: the seal, © year, and links to follow or contact the Owner. */
export function SiteFooter() {
  return (
    <footer className="mx-auto mt-16 w-full max-w-2xl px-4">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-rule py-7 text-sm text-ink-soft">
        <span className="flex items-center gap-2.5">
          <Seal size="small" />© {new Date().getFullYear()} Duncan Wen
        </span>
        <nav aria-label="聯絡與訂閱" className="flex flex-wrap gap-x-5 gap-y-2">
          {links.map(({ href, label }) => (
            <a key={href} href={href} className="break-all hover:text-accent">
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
