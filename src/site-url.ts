type Env = { SITE_URL?: string; VERCEL_URL?: string; [key: string]: string | undefined };

/**
 * The site's absolute base URL, for feeds, sitemaps, social previews and canonical links.
 *
 * SITE_URL is set on Vercel Production only. Preview deployments fall back to Vercel's
 * per-deployment VERCEL_URL (no protocol), and local development to localhost.
 */
export function siteUrl(env: Env = process.env): URL {
  const explicit = env.SITE_URL?.trim();
  if (explicit) return new URL(explicit);
  const vercel = env.VERCEL_URL?.trim();
  if (vercel) return new URL(`https://${vercel}`);
  return new URL("http://localhost:3000");
}

/** A site path, `/posts/<slug>`, as an absolute URL on the base URL: for the feed and sitemap. */
export function absoluteUrl(path: string, env: Env = process.env): string {
  return new URL(path, siteUrl(env)).href;
}
