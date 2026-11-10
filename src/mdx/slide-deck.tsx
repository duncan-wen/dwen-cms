import type { SlideDeckSource } from "./compile-mdx";
import { SlideDeckPlayer } from "./slide-deck-player";

type Props = {
  /** The Post's Slide deck as JSON, which compileMdx hands every `<SlideDeck />`. */
  deck?: string;
};

/** `<SlideDeck />` in a body: the Post's Slide deck, played in the reading column. */
export function SlideDeck({ deck }: Props) {
  if (deck === undefined) throw new Error("<SlideDeck /> needs a deck/ folder next to the Post; run pnpm deck");
  return <SlideDeckPlayer deck={JSON.parse(deck) as SlideDeckSource} />;
}
