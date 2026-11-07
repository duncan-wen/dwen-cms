// Shares a Published Post on LinkedIn as the Owner: the text of its LinkedIn share
// (content/posts/<slug>/linkedin.txt), then a link card with the live page's title,
// description and OG image. Run it only once the Owner has said to share the Post.
//   pnpm linkedin <slug>          show what would be posted, and post nothing
//   pnpm linkedin <slug> --post   post it, then record its URL as the file's `posted:` line
// Reads LINKEDIN_ACCESS_TOKEN (and LINKEDIN_TOKEN_DATE, when it was made) from .env.local:
// a token from https://www.linkedin.com/developers/tools/oauth/token-generator with the
// openid, profile and w_member_social scopes. Tokens last 60 days.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ContentValidationError } from "../src/content/content";
import { contentDir, getContent } from "../src/content/site-content";
import { littleText } from "../src/linkedin";

/** The production site. The card shows what Readers see there, so the Post must already be live. */
const SITE = "https://dwen-cms.vercel.app";
/** LinkedIn's API version, YYYYMM. Each lasts about a year; a 426 NONEXISTENT_VERSION means bump it. */
const LINKEDIN_VERSION = "202610";
const TOKEN_DAYS = 60;

const args = process.argv.slice(2);
const post = args.includes("--post");
const slug = args.find((arg) => !arg.startsWith("--"));
if (!slug) fail("Usage: pnpm linkedin <slug> [--post]");

try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local: the token may come from the environment instead.
}
const token = process.env.LINKEDIN_ACCESS_TOKEN;
if (!token) fail("No LINKEDIN_ACCESS_TOKEN in .env.local; make one with the token generator (see the top of scripts/linkedin.ts).");
warnIfTokenIsOld(process.env.LINKEDIN_TOKEN_DATE);

const content = await getContent().catch((error: unknown) => {
  if (!(error instanceof ContentValidationError)) throw error;
  fail(error.message);
});
const resolved = content.resolveSlug(slug);
if (resolved.kind !== "post") fail(`No Published Post has the Slug "${slug}" (${resolved.kind}).`);
const share = resolved.post.linkedInShare;
const shareFile = path.join(contentDir, "posts", slug, "linkedin.txt");
if (!share) fail(`Write the share's text in ${path.relative(process.cwd(), shareFile)} first.`);
if (share.postedUrl) fail(`Already shared: ${share.postedUrl}`);

const pageUrl = `${SITE}/posts/${slug}`;
const page = await fetch(pageUrl);
if (!page.ok) fail(`${pageUrl} answered ${page.status}: merge and deploy the Post before sharing it.`);
const html = await page.text();
const card = {
  url: meta(html, "og:url") ?? pageUrl,
  title: meta(html, "og:title"),
  description: meta(html, "og:description") ?? "",
  image: meta(html, "og:image"),
};
if (!card.title || !card.image) fail(`${pageUrl} has no og:title or og:image.`);

console.log(`── LinkedIn post (${post ? "posting" : "preview only; add --post to post"}) ──`);
console.log(share.text);
console.log(`\n── Link card ──\n${card.title}\n${card.description}\n${card.url}\nimage: ${card.image}`);
if (!post) process.exit(0);

const author = `urn:li:person:${(await linkedin<{ sub: string }>("GET", "/v2/userinfo")).sub}`;
const imageBytes = await fetch(card.image).then((response) => {
  if (!response.ok) fail(`Couldn't download the OG image: ${response.status}`);
  return response.arrayBuffer();
});
const upload = await linkedin<{ value: { uploadUrl: string; image: string } }>("POST", "/rest/images?action=initializeUpload", {
  initializeUploadRequest: { owner: author },
});
const uploaded = await fetch(upload.value.uploadUrl, {
  method: "PUT",
  headers: { Authorization: `Bearer ${token}` },
  body: imageBytes,
});
if (!uploaded.ok) fail(`LinkedIn refused the image upload: ${uploaded.status} ${await uploaded.text()}`);

// LinkedIn doesn't read the page's Open Graph tags, so the card's fields are set here.
const created = await linkedinResponse("POST", "/rest/posts", {
  author,
  commentary: littleText(share.text),
  visibility: "PUBLIC",
  distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] },
  content: {
    article: { source: card.url, title: card.title, description: card.description, thumbnail: upload.value.image },
  },
  lifecycleState: "PUBLISHED",
  isReshareDisabledByAuthor: false,
});
const postedUrl = `https://www.linkedin.com/feed/update/${created.headers.get("x-restli-id")}/`;
writeFileSync(shareFile, `posted: ${postedUrl}\n\n${readFileSync(shareFile, "utf8")}`);
console.log(`\nPosted: ${postedUrl}\nRecorded in ${path.relative(process.cwd(), shareFile)}: commit it.`);

async function linkedin<T>(method: string, path: string, body?: unknown): Promise<T> {
  return (await linkedinResponse(method, path, body)).json() as Promise<T>;
}

async function linkedinResponse(method: string, path: string, body?: unknown): Promise<Response> {
  const response = await fetch(`https://api.linkedin.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "LinkedIn-Version": LINKEDIN_VERSION,
      "X-Restli-Protocol-Version": "2.0.0",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (response.ok) return response;
  const advice =
    response.status === 401 ? " The token has expired or was revoked: make a new one and replace it in .env.local." : "";
  fail(`LinkedIn answered ${method} ${path} with ${response.status}: ${await response.text()}${advice}`);
}

/** A meta tag's content, by its property, with HTML entities undone. */
function meta(source: string, property: string): string | undefined {
  const content = source.match(new RegExp(`<meta property="${property}" content="([^"]*)"`))?.[1];
  return content
    ?.replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function warnIfTokenIsOld(date: string | undefined) {
  if (!date) return;
  const days = Math.floor((Date.now() - Date.parse(date)) / 86_400_000);
  if (days >= TOKEN_DAYS) fail(`The LinkedIn token is ${days} days old and has expired: make a new one.`);
  if (days >= TOKEN_DAYS - 10) console.warn(`⚠ The LinkedIn token expires in ${TOKEN_DAYS - days} days: make a new one soon.`);
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}
