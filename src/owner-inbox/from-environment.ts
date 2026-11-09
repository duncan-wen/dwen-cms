import { createOwnerInbox, type MailTransport } from "./owner-inbox";

/** Stands in for real mail where `MAIL_TRANSPORT=fake` asks for it (the smoke build): logs instead of sending. */
const fakeTransport: MailTransport = async ({ subject }) => {
  console.info(`Owner inbox (fake transport): would send "${subject}"`);
};

/**
 * The Owner inbox as this deployment is configured. Only an explicit `MAIL_TRANSPORT=fake`
 * fakes mail; a deployment without mail settings reports sending as unavailable.
 */
export function ownerInboxFromEnvironment(env: NodeJS.ProcessEnv = process.env) {
  const fake = env.MAIL_TRANSPORT === "fake";
  return createOwnerInbox({
    transport: fake ? fakeTransport : undefined,
    recipient: fake ? "owner@example.invalid" : env.OWNER_EMAIL,
  });
}
