"use client";

import { type ReactNode, useActionState } from "react";
import { type ContactFormState, sendContactMessage } from "@/app/about/send-contact-message";
import { fallbackContactLinks } from "@/contact-links";
import { CONTACT_LIMITS } from "@/owner-inbox/limits";
import type { ContactField, Issue } from "@/owner-inbox/owner-inbox";
import { LinkRow } from "./link-row";

const labels: Record<ContactField, string> = { name: "名字", email: "Email", message: "訊息" };

function issueText({ field, rule }: Issue) {
  if (rule === "required") return `請填寫${labels[field]}。`;
  if (rule === "not-an-email") return "這看起來不像 email 地址。";
  return `${labels[field]}最多 ${CONTACT_LIMITS[field]} 字。`;
}

const fieldClass =
  "mt-2 block w-full rounded-md border border-rule bg-paper px-3 py-2 text-base text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-wash aria-invalid:border-accent";

/** The Contact form: a Reader's name, an email to reply to and a message, sent to the Owner as email. */
export function ContactForm() {
  const [state, action, pending] = useActionState<ContactFormState, FormData>(sendContactMessage, {
    status: "idle",
  });

  if (state.status === "sent") {
    return (
      <p role="status" className="mt-4 rounded-md bg-accent-wash px-4 py-3 text-ink">
        收到了，我會盡快回覆。
      </p>
    );
  }

  const values = state.status === "idle" ? undefined : state.values;
  const issues = state.status === "invalid" ? state.issues : [];
  const issueFor = (field: ContactField) => issues.find((issue) => issue.field === field);

  const field = (name: ContactField, input: (props: InputProps) => ReactNode) => {
    const issue = issueFor(name);
    const errorId = `contact-${name}-error`;
    return (
      <div>
        <label htmlFor={`contact-${name}`} className="text-sm font-medium text-ink">
          {labels[name]}
        </label>
        {input({
          id: `contact-${name}`,
          name,
          required: true,
          defaultValue: values?.[name],
          "aria-invalid": issue ? true : undefined,
          "aria-describedby": issue ? errorId : undefined,
          className: fieldClass,
        })}
        {issue && (
          <p id={errorId} className="mt-1.5 text-sm text-accent">
            {issueText(issue)}
          </p>
        )}
      </div>
    );
  };

  return (
    <form action={action} className="mt-5 grid gap-5" aria-label="聯絡表單">
      {field("name", (props) => <input {...props} type="text" autoComplete="name" maxLength={CONTACT_LIMITS.name} />)}
      {field("email", (props) => (
        <input {...props} type="email" autoComplete="email" maxLength={CONTACT_LIMITS.email} />
      ))}
      {field("message", (props) => <textarea {...props} rows={6} maxLength={CONTACT_LIMITS.message} />)}
      {/* Only bots fill this in: it's off-screen, skipped by Tab and hidden from screen readers. */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label htmlFor="contact-website">網站</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {state.status === "unavailable" && (
        <div role="alert" className="text-sm text-ink">
          <p>訊息沒能送出，請稍後再試，或直接透過下面的方式聯絡我：</p>
          <LinkRow className="mt-2" links={fallbackContactLinks} />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-accent px-5 py-2 font-medium text-on-accent hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "送出中…" : "送出"}
        </button>
        <p className="text-sm text-ink-soft">你的 email 只用來回覆你，不會公開，也不會拿去寄電子報。</p>
      </div>
    </form>
  );
}

type InputProps = {
  id: string;
  name: string;
  required: boolean;
  defaultValue: string | undefined;
  "aria-invalid": true | undefined;
  "aria-describedby": string | undefined;
  className: string;
};
