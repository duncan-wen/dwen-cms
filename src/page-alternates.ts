import type { Metadata } from "next";

/**
 * A page's `alternates` metadata: its canonical URL, resolved against the configured
 * base URL (the root layout's `metadataBase`), and the RSS feed for feed readers to
 * discover. Next.js replaces a parent's `alternates` rather than merging it, so every
 * page sets both through here.
 */
export function pageAlternates(path: string): Metadata["alternates"] {
  return {
    canonical: path,
    types: { "application/rss+xml": [{ url: "/feed.xml", title: "Duncan Wen" }] },
  };
}
