import type { MetadataRoute } from "next";
import { getContent } from "@/content/site-content";
import { siteUrl } from "@/site-url";

/**
 * Every URL search engines should index: the listings, each Published Post, the
 * About Page and each Tag page. Previous and taken-down Slugs are left out, since
 * they redirect or answer 410.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getContent();
  const url = (path: string) => new URL(path, siteUrl()).href;
  const posts = content.listPublishedPosts();
  return [
    { url: url("/"), lastModified: posts[0]?.date },
    { url: url("/posts"), lastModified: posts[0]?.date },
    ...posts.map((post) => ({
      url: url(`/posts/${post.slug}`),
      lastModified: post.latestRevision?.date ?? post.date,
    })),
    ...(content.getPage("about") ? [{ url: url("/about") }] : []),
    { url: url("/tags") },
    ...content.listTagsWithCounts().map(({ tag }) => ({ url: url(`/tags/${tag}`) })),
  ];
}
