import type { MetadataRoute } from "next";
import { getContent } from "@/content/site-content";
import { lastUpdated } from "@/format-date";
import { absoluteUrl } from "@/site-url";

/**
 * Every URL search engines should index: the listings, each Published Post, each
 * Page (served at `/<name>`), each Tag page and each shown Series page. Previous and taken-down Slugs are
 * left out, since they redirect or answer 410.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getContent();
  const posts = content.listPublishedPosts();
  return [
    { url: absoluteUrl("/"), lastModified: posts[0]?.date },
    { url: absoluteUrl("/posts"), lastModified: posts[0]?.date },
    ...posts.map((post) => ({
      url: absoluteUrl(`/posts/${post.slug}`),
      lastModified: lastUpdated(post),
    })),
    ...content.listPages().map((page) => ({ url: absoluteUrl(`/${page.name}`) })),
    { url: absoluteUrl("/tags") },
    ...content.listTagsWithCounts().map(({ tag }) => ({ url: absoluteUrl(`/tags/${tag}`) })),
    ...content.listSeries().map(({ id }) => ({ url: absoluteUrl(`/series/${id}`) })),
  ];
}
