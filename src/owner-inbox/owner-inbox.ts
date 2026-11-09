import { CONTACT_LIMITS } from "./limits";

/** One email to the Owner. Who it's from is the mail transport's business. */
export type Email = { to: string; subject: string; text: string; replyTo?: string };

/** Sends one email, throwing when it can't. */
export type MailTransport = (email: Email) => Promise<void>;

/** What a Reader sends through the Contact form; `honeypot` is the field only bots fill in. */
export type ContactMessage = { name: string; email: string; message: string; honeypot?: string };

export type ContactField = "name" | "email" | "message";
export type Issue = { field: ContactField; rule: "required" | "too-long" | "not-an-email" };

export type InboxResult =
  | { ok: true }
  | { ok: false; reason: "invalid"; issues: Issue[] }
  | { ok: false; reason: "unavailable" };

type Dependencies = {
  /** Absent when the deployment has no mail settings: sending is then unavailable, never faked. */
  transport: MailTransport | undefined;
  recipient: string | undefined;
  log?: (message: string) => void;
};

// Deliberately loose: one @, no spaces, a dot in the domain. The Owner's reply is the real check.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Characters as a Reader counts them: an emoji is one, not two UTF-16 units. */
const length = (text: string) => [...text].length;

function check(message: Omit<ContactMessage, "honeypot">): Issue[] {
  const issues: Issue[] = [];
  for (const field of ["name", "email", "message"] as const) {
    const value = message[field];
    if (value === "") issues.push({ field, rule: "required" });
    else if (field === "email" && !EMAIL.test(value)) issues.push({ field, rule: "not-an-email" });
    else if (length(value) > CONTACT_LIMITS[field]) issues.push({ field, rule: "too-long" });
  }
  return issues;
}

/**
 * Everything a Reader sends the Owner goes through here and arrives as email; none of it
 * ever appears on the site. Mail and its recipient are passed in, so tests run on a fake.
 */
export function createOwnerInbox({ transport, recipient, log = console.error }: Dependencies) {
  async function deliver(email: Omit<Email, "to">): Promise<InboxResult> {
    if (!transport || !recipient) {
      log("Owner inbox: no mail transport or recipient is configured, so nothing was sent.");
      return { ok: false, reason: "unavailable" };
    }
    try {
      await transport({ ...email, to: recipient });
      return { ok: true };
    } catch (error) {
      log(`Owner inbox: sending failed: ${error instanceof Error ? error.message : String(error)}`);
      return { ok: false, reason: "unavailable" };
    }
  }

  return {
    async sendContactMessage({ honeypot, ...fields }: ContactMessage): Promise<InboxResult> {
      const message = { name: fields.name.trim(), email: fields.email.trim(), message: fields.message.trim() };
      const issues = check(message);
      if (issues.length > 0) return { ok: false, reason: "invalid", issues };
      // A bot gets the same answer as a person, so it can't tell it was caught.
      if (honeypot) return { ok: true };

      return deliver({
        subject: `聯絡表單：${message.name}`,
        replyTo: message.email,
        text: `名字：${message.name}\nEmail：${message.email}\n\n${message.message}\n`,
      });
    },
  };
}
