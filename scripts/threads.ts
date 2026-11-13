// Shares a Published Post on Threads as the Owner: the text of its Threads share
// (content/posts/<slug>/threads.txt) as a text post, with the live Post as its link card and
// the share's last line as its topic tag. Run it only once the Owner has said to share the Post.
//   pnpm threads <slug>          show what would be posted, and post nothing
//   pnpm threads <slug> --post   post it, then record its URL as the file's `posted:` line
// Reads THREADS_ACCESS_TOKEN, THREADS_TOKEN_DATE and THREADS_USER_ID from .env.local, written by
// `bash scripts/threads-setup.sh`. Tokens last 60 days; each run past the first day refreshes
// the token and writes it back, so only 60 days without a run means running the wizard again.
import { canRefreshThreadsToken } from "../src/share-token";
import { checkTokenAge, fail, livePage, loadEnv, postToShare, recordPosted, shareArgs, writeEnv } from "./share";

const GRAPH = "https://graph.threads.com";
const API = `${GRAPH}/v1.0`;
const TOKEN_DAYS = 60;
const RERUN_WIZARD = "run `bash scripts/threads-setup.sh` again.";

const { slug, post } = shareArgs("threads");
loadEnv();
let token = process.env.THREADS_ACCESS_TOKEN;
const userId = process.env.THREADS_USER_ID;
if (!token || !userId) fail(`No THREADS_ACCESS_TOKEN or THREADS_USER_ID in .env.local: ${RERUN_WIZARD}`);
const tokenDate = process.env.THREADS_TOKEN_DATE;
checkTokenAge("Threads", tokenDate, TOKEN_DAYS, RERUN_WIZARD);
if (tokenDate && canRefreshThreadsToken(tokenDate, new Date(), TOKEN_DAYS)) token = await refreshToken(token);

const { share, shareFile } = await postToShare(slug, "threads.txt", (found) => found.threadsShare);
const { pageUrl } = await livePage(slug);

console.log(`── Threads post (${post ? "posting" : "preview only; add --post to post"}) ──`);
console.log(share.text);
console.log(`\n── Topic tag ──\n#${share.topicTag}\n\n── Link card ──\n${pageUrl}`);
if (!post) process.exit(0);

const container = await threads<{ id: string }>("POST", `/${userId}/threads`, {
  media_type: "TEXT",
  text: share.text,
  link_attachment: pageUrl,
  topic_tag: share.topicTag,
});
await waitUntilFinished(container.id);
const published = await threads<{ id: string }>("POST", `/${userId}/threads_publish`, { creation_id: container.id });
const { permalink } = await threads<{ permalink?: string }>("GET", `/${published.id}`, { fields: "permalink" });
if (!permalink)
  fail(`Posted as ${published.id}, but Threads gave no permalink: record its URL in ${shareFile} by hand.`);
recordPosted(shareFile, permalink);

/** Swaps a token at least a day old for a fresh 60-day one, and saves it with today's date. */
async function refreshToken(current: string): Promise<string> {
  const response = await fetch(
    `${GRAPH}/refresh_access_token?grant_type=th_refresh_token&access_token=${encodeURIComponent(current)}`,
  );
  const body = (await response.json()) as { access_token?: string };
  if (!response.ok || !body.access_token) {
    console.warn(`⚠ Couldn't refresh the Threads token (${response.status}); using the current one.`);
    return current;
  }
  writeEnv("THREADS_ACCESS_TOKEN", body.access_token);
  writeEnv("THREADS_TOKEN_DATE", new Date().toISOString().slice(0, 10));
  return body.access_token;
}

/** Waits for a container to be ready to publish: Threads asks for up to 30 seconds. */
async function waitUntilFinished(id: string) {
  for (let attempt = 0; attempt < 15; attempt++) {
    const { status, error_message } = await threads<{ status: string; error_message?: string }>("GET", `/${id}`, {
      fields: "status,error_message",
    });
    if (status === "FINISHED") return;
    if (status === "ERROR" || status === "EXPIRED")
      fail(`Threads couldn't prepare the post: ${status} ${error_message ?? ""}`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  fail("Threads took over 30 seconds to prepare the post; nothing was published. Try again.");
}

async function threads<T>(method: "GET" | "POST", path: string, params: Record<string, string>): Promise<T> {
  const query = new URLSearchParams({ ...params, access_token: token! });
  const response = await fetch(`${API}${path}?${query}`, { method });
  if (response.ok) return (await response.json()) as T;
  const advice = response.status === 401 ? ` The token has expired or was revoked: ${RERUN_WIZARD}` : "";
  fail(`Threads answered ${method} ${path} with ${response.status}: ${await response.text()}${advice}`);
}
