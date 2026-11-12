import Link from "next/link";
import type { ReactNode } from "react";

type Props = { href: string; children: ReactNode };

/** The quiet underline every text link wears, darkening to the accent on hover. */
export const linkUnderline = "underline decoration-rule decoration-1 underline-offset-[5px] hover:decoration-accent";

const className = `font-medium text-accent ${linkUnderline}`;

/**
 * Whether `href` is one of this site's pages, which next/link prefetches and opens without a
 * reload. A file such as the RSS feed isn't: prefetching it asks the server to render it as a page.
 */
const isPage = (href: string) => href.startsWith("/") && !/\.[a-z0-9]+$/i.test(href.split(/[?#]/)[0]);

/** A standalone text link: accent text over a quiet underline that darkens on hover, no trailing 「→」. */
export function TextLink({ href, children }: Props) {
  if (!isPage(href)) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
