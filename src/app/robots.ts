import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/site-url";

/**
 * Every crawler may read everything, AI training crawlers included: the Owner's choice,
 * stated rather than left to a 404. One rule only, since a group naming a bot replaces `*`.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
