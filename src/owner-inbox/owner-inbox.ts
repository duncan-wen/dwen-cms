import { CONTACT_LIMITS, FEEDBACK_LINE_LIMIT } from "./limits";
import { VOTES } from "./votes";

/** One email to the Owner. Who it's from is the mail transport's business. */
export type Email = { to: string; subject: string; text: string; replyTo?: string };

/** Sends one email, throwing when it can't. */
export type MailTransport = (email: Email) => Promise<void>;

/** The three fields a Reader fills in on the Contact form. */
export type ContactFields = { name: string; email: string; message: string };
export type ContactField = keyof ContactFields;

/** What a Reader sends through the Contact form; `honeypot` is the field only bots fill in. */
export type ContactMessage = ContactFields & { honeypot?: string };
export type ContactIssue = { field: ContactField; rule: "required" | "too-long" | "not-an-email" };

export type Vote = "up" | "down";

/** A Reader's Feedback on a Post: the vote, and later perhaps one line about it. */
export type Feedback = { slug: string; vote: Vote; line?: string };
export type FeedbackIssue = { field: "slug" | "vote" | "line"; rule: "unknown" | "too-long" };

/** A Published Post as the Owner's email names it. */
export type PostReference = { title: string; url: string };

export type InboxResult<Issue = ContactIssue> =
  { ok: true } | { ok: false; reason: "invalid"; issues: Issue[] } | { ok: false; reason: "bot" | "unavailable" };

type Dependencies = {
  /** Absent when the deployment has no mail settings: sending is then unavailable, never faked. */
  transport: MailTransport | undefined;
  recipient: string | undefined;
  /** Whether this request comes from a bot; absent means nobody checks. */
  isBot?: () => Promise<boolean>;
  /** The Published Post a Slug names, from the site's content, never from the request. */
  findPost?: (slug: string) => PostReference | undefined;
  /** True everywhere but production: subjects then start with 【預覽】, so a test never passes for a Reader. */
  preview?: boolean;
  log?: (message: string) => void;
};

// Deliberately loose: one @, no spaces, a dot in the domain. The Owner's reply is the real check.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Characters as a Reader counts them: an emoji is one, not two UTF-16 units. */
const characterCount = (text: string) => [...text].length;

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

function checkContact(message: ContactFields): ContactIssue[] {
  const issues: ContactIssue[] = [];
  for (const field of ["name", "email", "message"] as const) {
    const value = message[field];
    if (value === "") issues.push({ field, rule: "required" });
    else if (field === "email" && !EMAIL.test(value)) issues.push({ field, rule: "not-an-email" });
    else if (characterCount(value) > CONTACT_LIMITS[field]) issues.push({ field, rule: "too-long" });
  }
  return issues;
}

/**
 * Everything a Reader sends the Owner goes through here and arrives as email; none of it
 * ever appears on the site. Mail, its recipient, the bot check and the Posts are passed in,
 * so tests run on fakes.
 */
export function createOwnerInbox({
  transport,
  recipient,
  isBot = async () => false,
  findPost = () => undefined,
  preview = false,
  log = console.error,
}: Dependencies) {
  /** Sends one email to the Owner, unless the request is a bot's or mail isn't set up. */
  async function deliver<Issue>(email: Omit<Email, "to">): Promise<InboxResult<Issue>> {
    try {
      if (await isBot()) return { ok: false, reason: "bot" };
    } catch (error) {
      log(`Owner inbox: the bot check failed: ${errorMessage(error)}`);
      return { ok: false, reason: "unavailable" };
    }
    if (!transport || !recipient) {
      log("Owner inbox: no mail transport or recipient is configured, so nothing was sent.");
      return { ok: false, reason: "unavailable" };
    }
    try {
      await transport({ ...email, subject: preview ? `【預覽】${email.subject}` : email.subject, to: recipient });
      return { ok: true };
    } catch (error) {
      log(`Owner inbox: sending failed: ${errorMessage(error)}`);
      return { ok: false, reason: "unavailable" };
    }
  }

  /**
   * Records one piece of Feedback, today as an email to the Owner. Storing Feedback for
   * statistics later changes only this function.
   */
  function recordFeedback(post: PostReference, vote: Vote, line: string | undefined) {
    return deliver<FeedbackIssue>({
      subject: `${line ? "回饋補充" : "回饋"} ${VOTES[vote].emoji}：${post.title}`,
      text: `文章：${post.title}\n網址：${post.url}\n回饋：${VOTES[vote].emoji} ${VOTES[vote].label}\n${line ? `\n${line}\n` : ""}`,
    });
  }

  return {
    async sendContactMessage({ honeypot, ...fields }: ContactMessage): Promise<InboxResult> {
      // A filled honeypot gets plain success before anything is checked, so a bot can't tell it was caught.
      if (honeypot) return { ok: true };
      const message = { name: fields.name.trim(), email: fields.email.trim(), message: fields.message.trim() };
      const issues = checkContact(message);
      if (issues.length > 0) return { ok: false, reason: "invalid", issues };

      return deliver({
        subject: `聯絡表單：${message.name}`,
        replyTo: message.email,
        text: `名字：${message.name}\nEmail：${message.email}\n\n${message.message}\n`,
      });
    },

    async sendFeedback({ slug, vote, line }: Feedback): Promise<InboxResult<FeedbackIssue>> {
      const issues: FeedbackIssue[] = [];
      const post = findPost(slug);
      if (!post) issues.push({ field: "slug", rule: "unknown" });
      if (vote !== "up" && vote !== "down") issues.push({ field: "vote", rule: "unknown" });
      const trimmedLine = line?.trim() || undefined;
      if (trimmedLine && characterCount(trimmedLine) > FEEDBACK_LINE_LIMIT) {
        issues.push({ field: "line", rule: "too-long" });
      }
      if (!post || issues.length > 0) return { ok: false, reason: "invalid", issues };

      return recordFeedback(post, vote, trimmedLine);
    },
  };
}
