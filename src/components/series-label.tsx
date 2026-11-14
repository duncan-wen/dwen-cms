import Link from "next/link";
import type { Series } from "@/content/content";
import { linkUnderline } from "./text-link";

type Props = {
  /** The shown Series the Post belongs to, from `getPostSeries`; undefined for none. */
  series: Series | undefined;
  className?: string;
};

/** 「系列：<title>」 on a Post in a list or grid, linking to its Series page; nothing for a Post in no shown Series. */
export function SeriesLabel({ series, className }: Props) {
  if (series === undefined) return null;
  return (
    <Link
      href={`/series/${series.id}`}
      className={[`w-fit text-[13px] text-ink-soft hover:text-accent ${linkUnderline}`, className]
        .filter(Boolean)
        .join(" ")}
    >
      系列：{series.title}
    </Link>
  );
}
