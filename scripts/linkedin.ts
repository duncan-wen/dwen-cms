// Shares a Published Post on LinkedIn as the Owner: the text of its LinkedIn share
// (content/posts/<slug>/linkedin.txt), then a link card with the live page's title,
// description and OG image. Run it only once the Owner has said to share the Post.
//   pnpm linkedin <slug>          show what would be posted, and post nothing
//   pnpm linkedin <slug> --post   post it, then record its URL as the file's `posted:` line
// Reads LINKEDIN_ACCESS_TOKEN (and LINKEDIN_TOKEN_DATE, when it was made) from .env.local:
// a token from https://www.linkedin.com/developers/tools/oauth/token-generator with the
// openid, profile and w_member_social scopes. Tokens last 60 days.
import { littleText } from "../src/linkedin";
import { checkTokenAge, fail, livePage, loadEnv, unpostedShare, recordPosted, shareArgs } from "./share";

/** LinkedIn's API version, YYYYMM. Each lasts about a year; a 426 NONEXISTENT_VERSION means bump it. */
const LINKEDIN_VERSION = "202610";
const TOKEN_DAYS = 60;

const { slug, post } = shareArgs("linkedin");
loadEnv();
const token = process.env.LINKEDIN_ACCESS_TOKEN;
if (!token)
  fail(
    "No LINKEDIN_ACCESS_TOKEN in .env.local; make one with the token generator (see the top of scripts/linkedin.ts).",
  );
checkTokenAge("LinkedIn", process.env.LINKEDIN_TOKEN_DATE, TOKEN_DAYS, "make a new one with the token generator.");

const { share, shareFile } = await unpostedShare(slug, "linkedin.txt", (found) => found.linkedInShare);
const { pageUrl, html } = await livePage(slug);
const card = {
  url: pageUrl,
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
const upload = await linkedin<{ value: { uploadUrl: string; image: string } }>(
  "POST",
  "/rest/images?action=initializeUpload",
  {
    initializeUploadRequest: { owner: author },
  },
);
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
recordPosted(shareFile, `https://www.linkedin.com/feed/update/${created.headers.get("x-restli-id")}/`);

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
    response.status === 401
      ? " The token has expired or was revoked: make a new one and replace it in .env.local."
      : "";
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
