"use server";

import { ownerInboxFromEnvironment } from "@/owner-inbox/from-environment";
import type { Feedback } from "@/owner-inbox/owner-inbox";

/** The Feedback block's Server Action: hands a vote, or the line after it, to the Owner inbox. */
export async function sendFeedback(feedback: Feedback): Promise<{ ok: boolean }> {
  const result = await ownerInboxFromEnvironment().sendFeedback(feedback);
  return { ok: result.ok };
}
