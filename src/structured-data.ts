import { ownerProfiles } from "@/contact-links";
import type { Post, Series } from "@/content/content";
import { isoDate, lastUpdated } from "@/format-date";
import { OWNER_NAME, SITE_LANGUAGE, SITE_NAME } from "@/site-name";
import { absoluteUrl } from "@/site-url";

/** A schema.org object, rendered as JSON-LD by `JsonLd`. */
export type StructuredData = { "@context": "https://schema.org"; "@type": string; [key: string]: unknown };

/** The Owner as a schema.org Person, pointing at the About Page. */
const owner = () => ({ "@type": "Person", name: OWNER_NAME, url: absoluteUrl("/about") });

/**
 * A Published Post as a `BlogPosting`. Dates stay date-only: a Post records no time of day,
 * so adding one would invent it. `dateModified` is `lastUpdated`, as in the sitemap.
 * A Post in a shown Series is part of it, as a `CreativeWorkSeries` naming the Series page.
 */
export function blogPosting(post: Post, series?: Series): StructuredData {
  const url = absoluteUrl(`/posts/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: isoDate(post.date),
    dateModified: isoDate(lastUpdated(post)),
    author: owner(),
    image: absoluteUrl(`/posts/${post.slug}/opengraph-image`),
    inLanguage: SITE_LANGUAGE,
    keywords: post.tags,
    url,
    mainEntityOfPage: url,
    ...(series && {
      isPartOf: { "@type": "CreativeWorkSeries", name: series.title, url: absoluteUrl(`/series/${series.id}`) },
    }),
  };
}

/**
 * The About Page as a `ProfilePage` about the Owner. `sameAs` is the Owner's profiles elsewhere.
 * No image: the site has no photo of the Owner, and the
 * seal is a logo, not a portrait.
 */
export function profilePage(): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: absoluteUrl("/about"),
    inLanguage: SITE_LANGUAGE,
    mainEntity: {
      ...owner(),
      sameAs: ownerProfiles.map(({ href }) => href),
    },
  };
}

/** The site as a `WebSite`, so search results show its name rather than its domain. */
export function webSite(): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    inLanguage: SITE_LANGUAGE,
  };
}

/** The structured data as a `<script>` body: JSON with `<` escaped, so no value can close the script. */
export function jsonLdText(data: StructuredData): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
