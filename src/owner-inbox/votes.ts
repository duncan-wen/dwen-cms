import type { Vote } from "./owner-inbox";

/** How each Feedback vote looks: on the Post's buttons and in the Owner's email. */
export const VOTES: Record<Vote, { emoji: string; label: string }> = {
  up: { emoji: "👍", label: "有幫助" },
  down: { emoji: "👎", label: "沒幫助" },
};
