"use client";

import { useState, useSyncExternalStore } from "react";
import { sendFeedback } from "@/app/posts/[slug]/send-feedback";
import { FEEDBACK_LINE_LIMIT } from "@/owner-inbox/limits";
import type { Vote } from "@/owner-inbox/owner-inbox";

type Props = { slug: string };

const storageKey = (slug: string) => `feedback:${slug}`;

/** Whether this browser already gave Feedback on the Post; unreadable storage counts as no. */
function alreadyGiven(slug: string) {
  try {
    return localStorage.getItem(storageKey(slug)) !== null;
  } catch {
    return false;
  }
}

function remember(slug: string, vote: Vote) {
  try {
    localStorage.setItem(storageKey(slug), vote);
  } catch {
    // Without storage the buttons just show again next time.
  }
}

const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};

type Phase =
  | { step: "ask" }
  | { step: "sending" }
  | { step: "line"; vote: Vote; sending?: boolean }
  | { step: "done" }
  | { step: "failed" };

const voteButton =
  "inline-flex items-center gap-2 rounded-md border border-rule bg-paper px-4 py-2 text-sm text-ink hover:border-accent hover:text-accent disabled:opacity-60";

/** At the end of a Post: 「這篇對你有幫助嗎？」, a one-click vote, then an optional line. */
export function FeedbackBlock({ slug }: Props) {
  const given = useSyncExternalStore(subscribe, () => alreadyGiven(slug), () => false);
  const [phase, setPhase] = useState<Phase>({ step: "ask" });

  async function vote(choice: Vote) {
    setPhase({ step: "sending" });
    const { ok } = await sendFeedback({ slug, vote: choice });
    if (!ok) return setPhase({ step: "failed" });
    remember(slug, choice);
    setPhase({ step: "line", vote: choice });
  }

  async function sendLine(form: FormData, choice: Vote) {
    const line = String(form.get("line") ?? "").trim();
    if (!line) return setPhase({ step: "done" });
    setPhase({ step: "line", vote: choice, sending: true });
    const { ok } = await sendFeedback({ slug, vote: choice, line });
    setPhase(ok ? { step: "done" } : { step: "failed" });
  }

  let body;
  if (phase.step === "line") {
    const choice = phase.vote;
    body = (
      <form action={(form) => sendLine(form, choice)} className="grid gap-3">
        <label htmlFor="feedback-line" className="text-ink">
          謝謝！想多說一句嗎？（選填）
        </label>
        <div className="flex flex-wrap gap-3">
          <input
            id="feedback-line"
            name="line"
            type="text"
            maxLength={FEEDBACK_LINE_LIMIT}
            className="min-w-0 flex-1 basis-56 rounded-md border border-rule bg-paper px-3 py-2 text-base text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-wash"
          />
          <button type="submit" disabled={phase.sending} className={voteButton}>
            {phase.sending ? "送出中…" : "送出"}
          </button>
        </div>
      </form>
    );
  } else if (phase.step === "done" || (phase.step === "ask" && given)) {
    body = <p className="text-ink">謝謝你的回饋。</p>;
  } else if (phase.step === "failed") {
    body = <p className="text-ink">回饋沒能送出，請稍後再試。</p>;
  } else {
    const sending = phase.step === "sending";
    body = (
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <p className="text-ink">這篇對你有幫助嗎？</p>
        <div className="flex gap-3">
          <button type="button" disabled={sending} onClick={() => vote("up")} className={voteButton}>
            <span aria-hidden="true">👍</span>有幫助
          </button>
          <button type="button" disabled={sending} onClick={() => vote("down")} className={voteButton}>
            <span aria-hidden="true">👎</span>沒幫助
          </button>
        </div>
      </div>
    );
  }

  return (
    <section aria-label="回饋" aria-live="polite" className="mt-14 rounded-md bg-paper-deep px-5 py-4">
      {body}
    </section>
  );
}
