import Link from "next/link";
import type { ReactNode } from "react";

type Props = { href: string; children: ReactNode };

/** A standalone text link: accent text over a quiet underline that darkens on hover, no trailing 「→」. */
export function TextLink({ href, children }: Props) {
  return (
    <Link
      href={href}
      className="font-medium text-accent underline decoration-rule decoration-1 underline-offset-[5px] hover:decoration-accent"
    >
      {children}
    </Link>
  );
}
