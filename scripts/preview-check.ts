// Requests every page and image a deployment serves and checks each answer, so a change to what
// its functions carry (next.config's outputFileTracingExcludes) is checked where it matters: on Vercel.
//   pnpm preview:check <deployment URL>
// Sends VERCEL_AUTOMATION_BYPASS_SECRET (from the environment or .env.local) past Deployment Protection. Expects 200 for
// every page, feed, icon, cover and Body image, 404 for a Post that doesn't exist, and 400, not
// 500, for feedback with a broken body. Prints each failure and exits non-zero on any.
import { postImageUrl } from "../src/post-image-url";
import { getContent } from "../src/content/site-content";
import { fail, loadEnv } from "./share";

const base = process.argv[2]?.replace(/\/$/, "");
if (!base?.startsWith("https://")) fail("Usage: pnpm preview:check <deployment URL>");
loadEnv();
const secret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const headers: Record<string, string> = secret ? { "x-vercel-protection-bypass": secret } : {};

const content = await getContent();
const posts = content.listPublishedPosts();
const ok = [
  "/",
  "/posts",
  "/tags",
  "/about",
  "/feed.xml",
  "/sitemap.xml",
  "/robots.txt",
  "/icon",
  ...posts.flatMap((post) => [
    `/posts/${post.slug}`,
    `/posts/${post.slug}/opengraph-image`,
    `/covers/${post.slug}.svg`,
    ...content.listPostImages(post.slug).map((image) => postImageUrl(post.slug, image.file)),
  ]),
  ...content.listTagsWithCounts().map(({ tag }) => `/tags/${tag}`),
  ...content.listSeries().map(({ id }) => `/series/${id}`),
];
const expectations: { path: string; status: number; init?: RequestInit }[] = [
  ...ok.map((path) => ({ path, status: 200 })),
  { path: "/posts/no-such-post", status: 404 },
  { path: "/api/feedback", status: 400, init: { method: "POST", body: "not json" } },
];

const failures: string[] = [];
for (const { path, status, init } of expectations) {
  const response = await fetch(`${base}${path}`, { ...init, headers, redirect: "manual" }).catch(() => undefined);
  if (response?.status !== status) failures.push(`${response?.status ?? "no answer"} ${path} (expected ${status})`);
}
console.log(`${expectations.length - failures.length} of ${expectations.length} answered as expected`);
if (failures.length > 0) fail(failures.join("\n"));
