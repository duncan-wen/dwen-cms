import type { ReactNode } from "react";

type Props = { title: ReactNode; children?: ReactNode };

/** The heading of a listing page: its title (h1) and an optional one-line summary under it. */
export function PageHeading({ title, children }: Props) {
  return (
    <header className="grid gap-2.5 pt-6 pb-10">
      <h1 className="text-[28px] font-black">{title}</h1>
      {children && <p className="text-[15px] text-ink-soft">{children}</p>}
    </header>
  );
}
