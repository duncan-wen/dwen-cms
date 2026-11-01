import type { ReactNode } from "react";

type Props = {
  title: ReactNode;
  /** `listing` for the Post list and Tag pages; `page` for a Post and the single pages (About, 404, taken-down). */
  size?: "listing" | "page";
  /** A one-line summary under the title. */
  summary?: ReactNode;
  /** Anything else the heading carries, such as a Post's date and Tags. */
  children?: ReactNode;
};

const styles = {
  listing: { header: "gap-2.5 pt-6", title: "text-[28px] font-black" },
  page: { header: "gap-[18px] pt-8", title: "text-[clamp(30px,5.6vw,40px)] leading-[1.38] font-black text-balance" },
} as const;

/** Every page's title (its h1), with an optional summary and other heading content under it. */
export function PageHeading({ title, size = "listing", summary, children }: Props) {
  return (
    <header className={`grid pb-10 ${styles[size].header}`}>
      <h1 className={styles[size].title}>{title}</h1>
      {summary && <p className="text-[15px] text-ink-soft">{summary}</p>}
      {children}
    </header>
  );
}
