import type { Post } from "@/content/content";
import { isoDate } from "@/format-date";
import { OWNER_NAME } from "@/site-name";
import { absoluteUrl } from "@/site-url";

/** A schema.org object, rendered as JSON-LD by `JsonLd`. */
export type StructuredData = { "@context": "https://schema.org"; "@type": string; [key: string]: unknown };

/** The language every page is written in, as `<html lang>` and the feed give it. */
const LANGUAGE = "zh-Hant";

/** The Owner as a schema.org Person, pointing at the About Page. */
const owner = () => ({ "@type": "Person", name: OWNER_NAME, url: absoluteUrl("/about") });

/**
 * A Published Post as a `BlogPosting`. Dates stay date-only: a Post records no time of day,
 * so adding one would invent it. `dateModified` follows the sitemap's rule: the latest
 * Revision's date, else the publication date.
 */
export function blogPosting(post: Post): StructuredData {
  const url = absoluteUrl(`/posts/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: isoDate(post.date),
    dateModified: isoDate(post.latestRevision?.date ?? post.date),
    author: owner(),
    image: absoluteUrl(`/posts/${post.slug}/opengraph-image`),
    inLanguage: LANGUAGE,
    keywords: post.tags,
    url,
    mainEntityOfPage: url,
  };
}

/** The structured data as a `<script>` body: JSON with `<` escaped, so no value can close the script. */
export function jsonLdText(data: StructuredData): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
