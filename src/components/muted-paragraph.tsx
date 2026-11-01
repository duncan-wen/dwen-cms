import type { ReactNode } from "react";

type Props = { children: ReactNode };

/** A body-sized paragraph in the soft ink, explaining a page that has no content of its own (404, taken-down). */
export function MutedParagraph({ children }: Props) {
  return <p className="text-[17px] leading-[1.95] text-ink-soft">{children}</p>;
}
