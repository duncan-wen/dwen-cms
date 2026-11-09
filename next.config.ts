import { withBotId } from "botid/next/config";
import type { NextConfig } from "next";
import { getContent } from "./src/content/site-content";

const nextConfig = async (): Promise<NextConfig> => ({
  // The content check's Mermaid parser runs from node_modules, unbundled: the server
  // bundle would compile out the `window` jsdom lends DOMPurify (src/mdx/parse-mermaid.ts).
  // subset-font too: bundled, harfbuzzjs can't find its own WebAssembly file (src/og/serif-font.ts).
  serverExternalPackages: ["mermaid", "jsdom", "subset-font"],
  env: {
    // The proxy can't read content at request time, so it gets the
    // taken-down Slugs at build time, comma-separated.
    TAKEN_DOWN_SLUGS: (await getContent()).listTakenDownSlugs().join(","),
    // Feedback names its Post in the Owner's email, but content isn't read at request
    // time, so each Published Post's title comes along at build time, keyed by Slug.
    POST_TITLES: JSON.stringify(
      Object.fromEntries((await getContent()).listPublishedPosts().map((post) => [post.slug, post.title])),
    ),
  },
});

// BotID proxies its challenge through the site, so a Reader's browser never calls a third party.
export default withBotId(nextConfig);
