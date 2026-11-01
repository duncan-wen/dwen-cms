import type { ReactNode } from "react";

type Props = { title?: string; children: ReactNode };

/** A boxed aside in a Post body, for a tip or warning the Reader shouldn't miss: `<Callout title="注意">…</Callout>`. */
export function Callout({ title, children }: Props) {
  return (
    <aside className="my-8 rounded-md border-l-2 border-accent bg-accent-wash px-5 py-4 [&>:first-child]:mt-0 [&>:last-child]:mb-0 [&_code]:bg-paper">
      {title && <p className="font-serif font-bold text-ink">{title}</p>}
      {children}
    </aside>
  );
}
