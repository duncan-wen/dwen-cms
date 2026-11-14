type Props = {
  /** The Post's place in its Series, counting from 1. */
  place: number;
  className?: string;
};

/** A Post's place in its Series, shown as `01` and read aloud as 「第 1 篇」. */
export function SeriesPlace({ place, className = "" }: Props) {
  return (
    <span className={className}>
      <span aria-hidden="true">{String(place).padStart(2, "0")}</span>
      <span className="sr-only">第 {place} 篇</span>
    </span>
  );
}
