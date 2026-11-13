// What `pnpm linkedin` and `pnpm threads` share: the environment, the Published Post and its
// Share file, the live page it links to, and recording the post's URL once it's posted.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ContentValidationError, type Post } from "../src/content/content";
import { contentDir, getContent } from "../src/content/site-content";
import { tokenStatus } from "../src/share-token";

/**
 * The production site, as Vercel Production's SITE_URL names it. A Share links to what Readers
 * see there, so the Post must already be live.
 */
export const SITE = "https://duncan-wen.aibbm.org";
const ENV_FILE = ".env.local";

export function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

/** `pnpm <platform> <slug> [--post]`: the Slug and whether to post. */
export function shareArgs(platform: string): { slug: string; post: boolean } {
  const args = process.argv.slice(2);
  const slug = args.find((arg) => !arg.startsWith("--"));
  if (!slug) fail(`Usage: pnpm ${platform} <slug> [--post]`);
  return { slug, post: args.includes("--post") };
}

/** Loads `.env.local` into the environment, when there is one. */
export function loadEnv() {
  try {
    process.loadEnvFile(ENV_FILE);
  } catch {
    // No .env.local: values may come from the environment instead.
  }
}

/** Replaces or adds `key` in `.env.local`, as the setup wizards write it. */
export function writeEnv(key: string, value: string) {
  const lines = readFileSync(ENV_FILE, "utf8")
    .trimEnd()
    .split("\n")
    .filter((line) => !line.startsWith(`${key}=`));
  writeFileSync(ENV_FILE, `${[...lines, `${key}='${value}'`].join("\n")}\n`);
}

/** Fails once a token made on `date` has expired, and warns from ten days before. */
export function checkTokenAge(platform: string, date: string | undefined, lifetimeDays: number, advice: string) {
  if (!date) return;
  const { state, daysLeft } = tokenStatus(date, new Date(), lifetimeDays);
  if (state === "expired") fail(`The ${platform} token has expired: ${advice}`);
  if (state === "warn") console.warn(`⚠ The ${platform} token expires in ${daysLeft} days: ${advice}`);
}

/**
 * The Published Post at `slug` and its Share for one platform, read through the content
 * module so the content check has passed; fails when there is none or it's already posted.
 */
export async function postToShare<S extends { postedUrl: string | undefined }>(
  slug: string,
  fileName: string,
  pick: (post: Post) => S | undefined,
): Promise<{ post: Post; share: S; shareFile: string }> {
  const content = await getContent().catch((error: unknown) => {
    if (!(error instanceof ContentValidationError)) throw error;
    fail(error.message);
  });
  const resolved = content.resolveSlug(slug);
  if (resolved.kind !== "post") fail(`No Published Post has the Slug "${slug}" (${resolved.kind}).`);
  const shareFile = path.join(contentDir, "posts", slug, fileName);
  const share = pick(resolved.post);
  if (!share) fail(`Write the share's text in ${path.relative(process.cwd(), shareFile)} first.`);
  if (share.postedUrl) fail(`Already shared: ${share.postedUrl}`);
  return { post: resolved.post, share, shareFile };
}

/** The Post's live page and its HTML; fails unless it answers and names itself as canonical. */
export async function livePage(slug: string): Promise<{ pageUrl: string; html: string }> {
  const pageUrl = `${SITE}/posts/${slug}`;
  const page = await fetch(pageUrl);
  if (!page.ok) fail(`${pageUrl} answered ${page.status}: merge and deploy the Post before sharing it.`);
  const html = await page.text();
  // The page names its own canonical URL from SITE_URL; a card pointing anywhere else would
  // send Readers to a second address of the same site.
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  if (canonical !== pageUrl)
    fail(
      `${pageUrl} names ${canonical} as its canonical URL: set SITE_URL on Vercel Production to ${SITE} and redeploy.`,
    );
  return { pageUrl, html };
}

/** Records a posted Share's URL as its file's first line, so it's never posted twice. */
export function recordPosted(shareFile: string, postedUrl: string) {
  writeFileSync(shareFile, `posted: ${postedUrl}\n\n${readFileSync(shareFile, "utf8")}`);
  console.log(`\nPosted: ${postedUrl}\nRecorded in ${path.relative(process.cwd(), shareFile)}: commit it.`);
}
