import { TextLink } from "@/components/text-link";
import { demoUrl } from "@/demo";

type Props = {
  /** The Demo's folder under `public/demos/`. */
  slug: string;
  /** What the Demo is, shown after 「互動展示：」 and read out for the frame. */
  title: string;
};

/**
 * `<Demo slug="…" title="…" />` in a body: the Demo playing in the reading column, portrait on a
 * phone and landscape above, with a link to open it on its own, full screen.
 */
export function Demo({ slug, title }: Props) {
  const url = demoUrl(slug);
  return (
    <figure aria-label={`互動展示：${title}`} className="not-prose my-8">
      <p className="mb-3 font-serif font-bold text-ink">互動展示：{title}</p>
      <iframe
        src={url}
        title={title}
        loading="lazy"
        allow="screen-wake-lock"
        className="block aspect-[3/4] w-full rounded-md border border-rule bg-paper-deep sm:aspect-[16/10]"
      />
      <figcaption className="mt-3 text-sm">
        <TextLink href={url}>全螢幕開啟</TextLink>
      </figcaption>
    </figure>
  );
}
