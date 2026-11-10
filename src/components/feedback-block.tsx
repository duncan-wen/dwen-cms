"use client";

import { useState, useSyncExternalStore } from "react";
import { FEEDBACK_LINE_LIMIT } from "@/owner-inbox/limits";
import type { Feedback, Vote } from "@/owner-inbox/owner-inbox";
import { VOTES } from "@/owner-inbox/votes";
import { inputClass } from "./input-class";

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

/**
 * Sends Feedback to its endpoint. `keepalive` lets the browser finish the request after the page
 * is gone, so a vote counts even when the Reader leaves right after clicking.
 */
async function sendFeedback(feedback: Feedback): Promise<{ ok: boolean }> {
  try {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(feedback),
      keepalive: true,
    });
    return { ok: response.ok };
  } catch {
    return { ok: false };
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
  | { step: "failed" }
  | { step: "line-failed" };

const voteButton =
  "inline-flex items-center gap-2 rounded-md border border-rule bg-paper px-4 py-2 text-sm text-ink hover:border-accent hover:text-accent disabled:opacity-60";

/** At the end of a Post: 「這篇對你有幫助嗎？」, a one-click vote, then an optional line. */
export function FeedbackBlock({ slug }: Props) {
  const given = useSyncExternalStore(
    subscribe,
    () => alreadyGiven(slug),
    () => false,
  );
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
    // The vote already arrived; only the line didn't.
    setPhase(ok ? { step: "done" } : { step: "line-failed" });
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
            className={`min-w-0 flex-1 basis-56 ${inputClass}`}
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
  } else if (phase.step === "line-failed") {
    body = <p className="text-ink">這句沒能送出，不過你的投票已經收到了，謝謝。</p>;
  } else {
    const sending = phase.step === "sending";
    body = (
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <p className="text-ink">這篇對你有幫助嗎？</p>
        <div className="flex gap-3">
          {(["up", "down"] as const).map((choice) => (
            <button key={choice} type="button" disabled={sending} onClick={() => vote(choice)} className={voteButton}>
              <span aria-hidden="true">{VOTES[choice].emoji}</span>
              {VOTES[choice].label}
            </button>
          ))}
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
