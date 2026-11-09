import { afterEach, describe, expect, it, vi } from "vitest";
import { ownerInboxFromEnvironment } from "./from-environment";

const reader = { name: "王小明", email: "reader@example.com", message: "嗨" };

describe("ownerInboxFromEnvironment", () => {
  afterEach(() => vi.restoreAllMocks());

  it("is unavailable, and logs why, in production without a Resend key", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    const inbox = ownerInboxFromEnvironment({ VERCEL_ENV: "production", OWNER_EMAIL: "owner@example.com" });
    expect(await inbox.sendContactMessage(reader)).toEqual({ ok: false, reason: "unavailable" });
    expect(error).toHaveBeenCalledOnce();
  });

  it("is unavailable without a recipient, even with a Resend key", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const inbox = ownerInboxFromEnvironment({ VERCEL_ENV: "production", RESEND_API_KEY: "re_test" });
    expect(await inbox.sendContactMessage(reader)).toEqual({ ok: false, reason: "unavailable" });
  });

  it("fakes mail only when MAIL_TRANSPORT=fake asks for it, marking the subject outside production", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    const inbox = ownerInboxFromEnvironment({ MAIL_TRANSPORT: "fake" });
    expect(await inbox.sendContactMessage(reader)).toEqual({ ok: true });
    expect(info).toHaveBeenCalledWith(expect.stringContaining("【預覽】聯絡表單：王小明"));
  });
});
