import { describe, expect, it, vi } from "vitest";
import { CONTACT_LIMITS } from "./limits";
import { createOwnerInbox, type Email } from "./owner-inbox";

const reader = { name: "王小明", email: "reader@example.com", message: "想請教你一個專案的事。" };

/** An Owner inbox whose sent emails and logged errors are recorded. */
function inbox(
  overrides: {
    transport?: ((email: Email) => Promise<void>) | null;
    recipient?: string | null;
    preview?: boolean;
    isBot?: () => Promise<boolean>;
  } = {},
) {
  const sent: Email[] = [];
  const log = vi.fn();
  const transport =
    overrides.transport === null ? undefined : (overrides.transport ?? (async (email: Email) => void sent.push(email)));
  const recipient = overrides.recipient === null ? undefined : (overrides.recipient ?? "owner@example.com");
  return { sent, log, ...createOwnerInbox({ transport, recipient, preview: overrides.preview, isBot: overrides.isBot, log }) };
}

describe("sendContactMessage", () => {
  it("emails the Owner the Reader's name, email and message, with Reply-To set to the Reader", async () => {
    const { sent, sendContactMessage } = inbox();

    expect(await sendContactMessage(reader)).toEqual({ ok: true });
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({ to: "owner@example.com", replyTo: "reader@example.com" });
    expect(sent[0].subject).toContain("王小明");
    for (const part of ["王小明", "reader@example.com", "想請教你一個專案的事。"]) expect(sent[0].text).toContain(part);
  });

  it("trims every field before checking and sending", async () => {
    const { sent, sendContactMessage } = inbox();

    await sendContactMessage({ name: "  王小明 ", email: " reader@example.com\n", message: "\n 嗨 \n" });
    expect(sent[0].replyTo).toBe("reader@example.com");
    expect(sent[0].text).toContain("嗨");
    expect(sent[0].text).not.toContain("\n 嗨");
  });

  it.each(["name", "email", "message"] as const)("rejects an empty %s, even one of only spaces", async (field) => {
    const { sent, sendContactMessage } = inbox();

    expect(await sendContactMessage({ ...reader, [field]: "   " })).toEqual({
      ok: false,
      reason: "invalid",
      issues: [{ field, rule: "required" }],
    });
    expect(sent).toHaveLength(0);
  });

  it.each(["name", "message"] as const)("accepts a %s at its limit and rejects one character over", async (field) => {
    const { sendContactMessage } = inbox();
    const limit = CONTACT_LIMITS[field];

    expect(await sendContactMessage({ ...reader, [field]: "字".repeat(limit) })).toEqual({ ok: true });
    expect(await sendContactMessage({ ...reader, [field]: "字".repeat(limit + 1) })).toEqual({
      ok: false,
      reason: "invalid",
      issues: [{ field, rule: "too-long" }],
    });
  });

  it("counts an emoji as one character", async () => {
    const { sendContactMessage } = inbox();

    expect(await sendContactMessage({ ...reader, name: "👋".repeat(CONTACT_LIMITS.name) })).toEqual({ ok: true });
  });

  it.each(["reader", "reader@", "@example.com", "reader@example", "a b@example.com"])(
    "rejects %j as a reply email",
    async (email) => {
      const { sendContactMessage } = inbox();

      expect(await sendContactMessage({ ...reader, email })).toEqual({
        ok: false,
        reason: "invalid",
        issues: [{ field: "email", rule: "not-an-email" }],
      });
    },
  );

  it("reports every invalid field at once", async () => {
    const { sendContactMessage } = inbox();

    expect(await sendContactMessage({ name: "", email: "nope", message: "" })).toEqual({
      ok: false,
      reason: "invalid",
      issues: [
        { field: "name", rule: "required" },
        { field: "email", rule: "not-an-email" },
        { field: "message", rule: "required" },
      ],
    });
  });

  it("reports success but sends nothing when the honeypot is filled", async () => {
    const { sent, sendContactMessage } = inbox();

    expect(await sendContactMessage({ ...reader, honeypot: "https://spam.example" })).toEqual({ ok: true });
    expect(sent).toHaveLength(0);
  });

  it("is unavailable, and logs why, when no mail transport is configured", async () => {
    const { log, sendContactMessage } = inbox({ transport: null });

    expect(await sendContactMessage(reader)).toEqual({ ok: false, reason: "unavailable" });
    expect(log).toHaveBeenCalledOnce();
  });

  it("is unavailable, and logs why, when no recipient is configured", async () => {
    const { log, sendContactMessage } = inbox({ recipient: null });

    expect(await sendContactMessage(reader)).toEqual({ ok: false, reason: "unavailable" });
    expect(log).toHaveBeenCalledOnce();
  });

  it("is unavailable, and logs why, when sending fails", async () => {
    const { log, sendContactMessage } = inbox({
      transport: async () => {
        throw new Error("mail service down");
      },
    });

    expect(await sendContactMessage(reader)).toEqual({ ok: false, reason: "unavailable" });
    expect(log).toHaveBeenCalledWith(expect.stringContaining("mail service down"));
  });

  it("starts the subject with 【預覽】 outside production", async () => {
    const { sent, sendContactMessage } = inbox({ preview: true });

    await sendContactMessage(reader);
    expect(sent[0].subject).toBe("【預覽】聯絡表單：王小明");
  });

  it("leaves the subject alone in production", async () => {
    const { sent, sendContactMessage } = inbox({ preview: false });

    await sendContactMessage(reader);
    expect(sent[0].subject).toBe("聯絡表單：王小明");
  });

  it("sends nothing when the bot check says bot", async () => {
    const { sent, sendContactMessage } = inbox({ isBot: async () => true });

    expect(await sendContactMessage(reader)).toEqual({ ok: false, reason: "bot" });
    expect(sent).toHaveLength(0);
  });

  it("sends when the bot check says human", async () => {
    const { sent, sendContactMessage } = inbox({ isBot: async () => false });

    expect(await sendContactMessage(reader)).toEqual({ ok: true });
    expect(sent).toHaveLength(1);
  });

  it("is unavailable, and logs why, when the bot check itself fails", async () => {
    const { log, sent, sendContactMessage } = inbox({
      isBot: async () => {
        throw new Error("no BotID headers");
      },
    });

    expect(await sendContactMessage(reader)).toEqual({ ok: false, reason: "unavailable" });
    expect(log).toHaveBeenCalledWith(expect.stringContaining("no BotID headers"));
    expect(sent).toHaveLength(0);
  });
});
