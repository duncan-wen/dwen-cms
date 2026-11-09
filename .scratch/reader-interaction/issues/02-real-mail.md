# 02: Real mail through Resend from the Owner's domain

**What to build:** A Contact form message sent on the live site lands in the Owner's inbox, from a verified address on `duncan-wen.aibbm.org`, and the Owner's Reply goes straight to the Reader. A message sent from a Vercel preview arrives with 【預覽】 at the start of its subject. Resend is provisioned through the Vercel Marketplace; the domain's DNS records go into Cloudflare, which only the Owner can do, guided by a generated `/wizard`. See `../spec.md`.

**Blocked by:** 01

**Status:** done

- [x] Resend provisioned with `vercel integration add resend/resend-email` (linked from the scratchpad, never the repo), its env vars present for production and preview
- [x] A `/wizard` walks the Owner through adding Resend's DNS records for `duncan-wen.aibbm.org` in Cloudflare and confirming the domain verifies
- [x] A Resend transport sends from the verified address; production and preview use it, the smoke build keeps the fake one
- [x] Outside production, the subject starts with 【預覽】; vitest covers the prefix by environment
- [x] A missing Resend key in production returns `unavailable` and logs an error; vitest covers it
- [x] On the PR's Vercel preview, the agent sends one Contact form message; the Owner confirms the 【預覽】 email arrived and Reply addresses the Reader

## Comments

- 2026-11-10: Resend provisioned in `ap-northeast-1` for `duncan-wen.aibbm.org`; `RESEND_API_KEY` and `OWNER_EMAIL` set for production and preview. The Owner added the three DNS records in Cloudflare through the wizard, and Resend reports the domain verified. The wizard's own DNS check queried Google's resolver too early and hit its negative cache; Resend's verification was triggered directly instead.
- 2026-11-10: The agent sent a Contact form message on the PR #63 preview; Resend reports it delivered, and the Owner confirmed the 【預覽】 email arrived.
