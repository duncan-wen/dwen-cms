import { ownerInboxFromEnvironment } from "@/owner-inbox/from-environment";
import type { Feedback } from "@/owner-inbox/owner-inbox";

/**
 * The Feedback block's endpoint: hands a vote, or the line after it, to the Owner inbox. It's a
 * route rather than a Server Action so the browser can send it with `keepalive`, which finishes
 * the request even if the Reader leaves the page right after clicking.
 */
export async function POST(request: Request) {
  const feedback = asFeedback(await request.json().catch(() => null));
  const result = feedback ? await ownerInboxFromEnvironment().sendFeedback(feedback) : null;
  const status = !result ? 400 : result.ok ? 200 : FAILURE_STATUS[result.reason];
  return Response.json({ ok: status === 200 }, { status });
}

const FAILURE_STATUS = { invalid: 400, bot: 403, unavailable: 503 } as const;

/** The request body's shape, before the Owner inbox checks what it says. */
function asFeedback(body: unknown): Feedback | null {
  if (typeof body !== "object" || body === null) return null;
  const { slug, vote, line } = body as Record<string, unknown>;
  if (typeof slug !== "string" || typeof vote !== "string") return null;
  if (line !== undefined && typeof line !== "string") return null;
  return { slug, vote: vote as Feedback["vote"], ...(line === undefined ? {} : { line }) };
}
