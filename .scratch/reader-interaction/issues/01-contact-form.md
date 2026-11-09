# 01: Contact form, end to end on a fake transport

**What to build:** A Reader who follows any 「聯絡我」 lands on the About page's contact section and finds the Contact form: name, an email to reply to, a message, and the one-line privacy note. Sending a valid form replaces it in place with 「收到了，我會盡快回覆」; an empty or over-long field is flagged before sending; a failure shows an error with LinkedIn and the email address as fallbacks. Behind it, the Owner inbox's *send a Contact message* checks the limits, drops a filled honeypot while reporting success, composes the email (Reader's details in the body, Reply-To set to the Reader) and hands it to the mail transport. In this ticket the only transport is the fake one the smoke build selects by environment variable; with no transport configured, sending fails as `unavailable` and the server logs an error. The footer's contact links lose the `mailto:` and gain the Contact form. See `../spec.md`.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] The Owner inbox exposes *send a Contact message*, returning success or a named failure (`invalid` naming field and rule, `unavailable`), with the mail transport passed in
- [x] Limits enforced after trimming: name 1–50, message 1–2000, reply email a valid address; the form's hints read the same limits from one shared source
- [x] A filled honeypot (hidden from people and assistive technology) reports success and sends nothing
- [x] The composed email carries the Reader's name, email and message, with Reply-To set to the Reader's email; the recipient comes from an environment variable
- [x] With no transport configured, sending returns `unavailable` and logs a server error; nothing pretends to succeed
- [x] The Contact form sits in the About page's `#contact` section above the remaining contact links, and the About page's link list leaves out the link to itself
- [x] `contactLinks` drops the `mailto:` entry and gains 「聯絡表單」 → `/about#contact`; the footer shows it
- [x] Success replaces the form in place; `unavailable` shows the error with LinkedIn and the email address
- [x] vitest covers the Owner inbox through its exports with a fake transport: each limit at its edge, trimming, honeypot, Reply-To, `unavailable`
- [x] Smoke covers: the form in `#contact`, the footer without `mailto:` and linking to the form, a valid send showing the confirmation, an empty required field blocking the send; the existing footer and `#contact` smoke tests are updated
- [x] The Owner inbox is added to the "one way to do each thing" list in `CODING_STANDARDS.md`
- [x] `pnpm shots /about` in light and dark at 1280px and 375px, read before ticking; the Owner says OK to the screenshots

## Comments

- 2026-11-10: The Owner said OK to the `/about` screenshots (light and dark, 1280px and 375px).
