import { Resend } from "resend";
import { absoluteUrl } from "@/site-url";
import { createOwnerInbox, type MailTransport, type PostReference } from "./owner-inbox";
import { OWNER_NAME } from "@/site-name";

/** The verified sender on the Owner's domain; Resend refuses any address it hasn't verified. */
export const MAIL_FROM = `${OWNER_NAME} 網站 <noreply@duncan-wen.aibbm.org>`;

/** Stands in for real mail where `MAIL_TRANSPORT=fake` asks for it (the smoke build): logs instead of sending. */
const fakeTransport: MailTransport = async ({ subject }) => {
  console.info(`Owner inbox (fake transport): would send "${subject}"`);
};

/** Sends through Resend, throwing on the error Resend returns rather than throws. */
function resendTransport(apiKey: string): MailTransport {
  const resend = new Resend(apiKey);
  return async ({ to, subject, text, replyTo }) => {
    const { error } = await resend.emails.send({ from: MAIL_FROM, to, subject, text, replyTo });
    if (error) throw new Error(`Resend: ${error.name}: ${error.message}`);
  };
}

/** Each Published Post's title by Slug, written into the build by next.config.ts. */
const postTitles: Record<string, string> = JSON.parse(process.env.POST_TITLES ?? "{}");

/** The Published Post a Slug names, as the Owner's email shows it. */
function findPost(slug: string): PostReference | undefined {
  const title = Object.hasOwn(postTitles, slug) ? postTitles[slug] : undefined;
  return title === undefined ? undefined : { title, url: absoluteUrl(`/posts/${slug}`) };
}

/** BotID's verdict on the current request; loaded on demand, since it reads the request's headers. */
async function botIdSaysBot() {
  const { checkBotId } = await import("botid/server");
  return (await checkBotId()).isBot;
}

/**
 * The Owner inbox as this deployment is configured: Resend with `RESEND_API_KEY` to
 * `OWNER_EMAIL`, or a fake only where `MAIL_TRANSPORT=fake` says so. Without mail
 * settings, sending is unavailable, never faked. BotID checks every request except where
 * mail is faked. Only production leaves subjects unmarked.
 */
export function ownerInboxFromEnvironment(env: Record<string, string | undefined> = process.env) {
  const preview = env.VERCEL_ENV !== "production";
  if (env.MAIL_TRANSPORT === "fake") {
    return createOwnerInbox({ transport: fakeTransport, recipient: "owner@example.invalid", findPost, preview });
  }
  return createOwnerInbox({
    transport: env.RESEND_API_KEY ? resendTransport(env.RESEND_API_KEY) : undefined,
    isBot: botIdSaysBot,
    findPost,
    recipient: env.OWNER_EMAIL,
    preview,
  });
}
