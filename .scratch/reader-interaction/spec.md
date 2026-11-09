# Spec: Reader interaction — Contact form and Feedback

**Status:** done

## Problem Statement

The Owner wants Readers to be able to reach them and to tell them whether a Post helped. Today the only way to get in touch is a `mailto:` link in the footer and the About page's contact section. On many desktops that link does nothing, because no mail program is set up, so a prospective employer or client who wants to get in touch can quietly fail to. And the Owner has no way to learn whether a Post landed with Readers.

The Owner can't take on a moderation queue, an admin panel or a database to look after. Under ADR 0001 nothing goes live on the site except what the Owner publishes through git.

## Solution

Two kinds of Reader interaction. Both reach the Owner as email and never appear on the site:

1. **Contact form**: a form in the About page's contact section (`/about#contact`). Every 「聯絡我」 on the site already leads there. The Reader gives their name, an email to reply to and a message. The Owner gets an email whose Reply-To is the Reader's address, so replying in their mail client answers the Reader directly. The form replaces the email link among the Owner's contact links.
2. **Feedback**: at the end of every Post, 「這篇對你有幫助嗎？」 with 👍 and 👎. One click sends right away. Then an optional one-line box offers to say more, and if the Reader fills it in, a second email follows. Both emails name the Post and link to it. The browser remembers that this Post got Feedback and shows a thank-you instead of the buttons the next time.

Contact form ships first. Feedback reuses the same pipeline.

## User Stories

1. As a Reader, I want a contact form that works without a mail program, so that I can reach the Owner from any device.
2. As a Reader, I want every 「聯絡我」 on the site (home page, end of a Post, footer) to take me to the Contact form, so that I never hunt for how to get in touch.
3. As a Reader, I want only three fields (name, my email, message), so that getting in touch takes a minute.
4. As a Reader, I want to be told before sending when a required field is empty or too long, so that I don't lose my message to a rejected submission.
5. As a Reader, I want a one-line note that my email is used only to reply, isn't shown anywhere and isn't used for a newsletter, so that I'm comfortable giving it.
6. As a Reader, I want the form to turn into a 「收到了，我會盡快回覆」 message after I send, without leaving the page, so that I know it worked.
7. As a Reader, I want to see an error and another way to reach the Owner (LinkedIn, and the email address) if sending fails, so that my effort isn't wasted.
8. As a Reader, I don't want a CAPTCHA, so that getting in touch isn't a chore.
9. As a Reader, I want the GitHub, LinkedIn and RSS links still beside the form, so that I can follow the Owner without writing to them.
10. As the Owner, I want each Contact form message to arrive in my inbox with the Reader's name, email and message, so that I can answer promptly.
11. As the Owner, I want to reply to a Contact form email with my mail client's Reply button and have it go to the Reader, so that I don't copy addresses around.
12. As the Owner, I want automated submissions dropped before they reach me, so that my inbox isn't flooded.
13. As the Owner, I want mail sent from my own verified domain, so that it doesn't land in spam.
14. As the Owner, I want mail sent from a Vercel preview to say 【預覽】 in its subject, so that I can verify a PR end to end and never confuse it with a real Reader.
15. As the Owner, I want production to refuse to start sending, loudly, if its mail settings are missing, so that messages are never silently dropped.
16. As the Owner, I want nothing a Reader sends to ever appear on the site, so that only what I publish goes live.
17. As the Owner, I want no database, admin panel or moderation queue, so that the site needs no upkeep beyond answering mail.
18. As a Reader, I want to say whether a Post helped me with a single click, so that giving Feedback costs nothing.
19. As a Reader, I want to optionally add one line after clicking, so that I can say what was missing or what helped.
20. As a Reader, I want my click to count even if I leave right after, so that I needn't stay to finish anything.
21. As a Reader, I want the Post to thank me instead of asking again when I come back to it, so that I'm not nagged.
22. As a Reader, I don't want to see vote counts, so that a Post is judged on its content.
23. As the Owner, I want each Feedback email to name the Post, link to it, and say 👍 or 👎, so that I know which Post it's about without guessing.
24. As the Owner, I want the optional line to arrive as its own email tied to the same Post, so that a click is never lost waiting for text.
25. As the Owner, I want Feedback only on Posts, not on Pages, so that it asks a question that makes sense.
26. As the Owner, I want recording a piece of Feedback to live in one module, so that I can later also store it for statistics without touching the form or the pages.
27. As a Writing Agent, I want the Feedback block to appear on every Post automatically, so that no Post's frontmatter or body has to opt in.

## Implementation Decisions

- **One new deep module: the Owner inbox.** It exposes two operations, *send a Contact message* and *send Feedback*. Each returns either success or one named failure (`invalid` naming the field and rule, `bot`, `unavailable`). Everything rule-bearing lives behind it: required fields and length limits, dropping a filled honeypot, the bot verdict, composing the email (subject, body, Reply-To), and the 【預覽】 prefix outside production. Its two dependencies are passed in: a **mail transport** (send one email) and a **bot check** (is this request a bot). The pages and form components never talk to Resend or BotID directly.
- **Limits**: name 1–50 characters, message 1–2000, Feedback line 1–200 (optional as a whole), reply email must be a valid address. Text is trimmed before checking. The same limits drive the form's own client-side hints, from one shared source.
- **Honeypot**: a field hidden from people and from assistive technology. If it's filled, the submission is reported to the Reader as a success but never sent.
- **Bot protection**: Vercel BotID, checked on the server for both operations. No CAPTCHA, no rate limiting for now.
- **Mail**: Resend, provisioned through the Vercel Marketplace (`vercel integration add resend/resend-email`), sending from a verified address on `duncan-wen.aibbm.org`. That domain's DNS is on Cloudflare, so adding Resend's records is a step only the Owner can take. Generate a `/wizard` for it. The recipient is the Owner's address, held in an environment variable rather than in code.
- **Transport choice**: production and preview use the Resend transport. The smoke build selects a fake transport through an explicit environment variable. With that variable absent and Resend's key missing, sending fails as `unavailable` and the server logs an error. It never silently pretends to succeed.
- **Contact form**: submitted through a Next.js Server Action that calls the Owner inbox. It lives in the About page's `#contact` section above the remaining contact links. `contactLinks` drops the `mailto:` entry and gains one for the Contact form (`/about#contact`), so the footer leads to the form. The About page's own link list leaves out the link that points at itself. On success the form is replaced in place by the confirmation. On `unavailable` it shows the error with LinkedIn and the email address as fallbacks.
- **Feedback**: a block at the end of every Post's body, before the Post's closing footer. The click calls *send Feedback* with the Post's Slug and 👍/👎. The optional line calls it again with the same Slug, vote and the text. The Owner inbox resolves the Slug to the Post's title and absolute URL through the content module's queries, never from the request. The "already gave Feedback" memory is browser storage keyed by Slug. Storage that's unavailable just means the buttons show again.
- **No database.** Recording Feedback is a single function inside the Owner inbox. Adding storage later changes only that function.
- **Reader-facing names**: 「聯絡表單」 for the Contact form (in `GLOSSARY.md`). Feedback has no Reader-facing noun: the block asks a question. Code and tests use the glossary's English terms, Contact form and Feedback.
- **New shared piece**: the Owner inbox joins the "one way to do each thing" list in `CODING_STANDARDS.md`. Any future message to the Owner goes through it.

## Testing Decisions

- Good tests check behaviour through a public interface, never internals (per `CODING_STANDARDS.md`).
- **Owner inbox (vitest)**: called directly, with a fake transport that records sent emails and a fake bot check. It covers every limit at its edge, the trimming, the honeypot (success reported, nothing sent), a bot verdict, the Reply-To, the 【預覽】 prefix by environment, Feedback naming the Post's title and URL from its Slug, an unknown Slug rejected, and a missing Resend key reported as `unavailable`. Prior art: `src/linkedin.test.ts` and `src/site-url.test.ts`, which test pure module exports.
- **Smoke (Playwright, `e2e/content` build, fake transport)**: the About page's `#contact` shows the Contact form; the footer's contact links lead to it and no longer contain a `mailto:`; sending a filled form shows the confirmation; an empty required field blocks sending; a Post shows the Feedback block and a Page doesn't; clicking 👍 shows the optional line, and coming back to the Post shows the thank-you. The existing smoke tests about the footer links and the About page's `#contact` links are updated to match. Prior art: the footer and `#contact` tests in `e2e/smoke.spec.ts`.
- **Visual**: `pnpm shots /about /posts/typography-sample` in light and dark, at 1280px and 375px, for the Owner's review.
- **End-to-end on preview**: once Resend and the domain are set up, the agent sends one Contact form message and one piece of Feedback on the PR's Vercel preview. The Owner confirms both 【預覽】 emails arrived.

## Out of Scope

- Showing anything a Reader sent on the site: public comments, vote counts, testimonials.
- A database, a Feedback statistics view, or a weekly digest.
- A confirmation email to the Reader.
- CAPTCHA and rate limiting (revisit only if spam gets through).
- Feedback on Pages.
- A newsletter or subscriptions.
- Final copy wording beyond what's named here: the Owner adjusts it from the screenshots.

## Further Notes

- Ship as two tickets on one integration branch, `reader-interaction`: the Contact form first (Owner inbox, Resend and domain setup, BotID, About page and contact links), then Feedback (reusing the Owner inbox).
- The Owner is on Vercel's Hobby plan. Web Analytics custom events aren't available there, which is one reason Feedback goes to email.
- ADR considered and skipped: "email rather than a database" is easy to reverse, and the Owner inbox seam keeps it that way.
- The Owner's email address stays public in old copies of the site and in the Contact form's failure fallback. Removing the `mailto:` link makes the form the main way in. It doesn't try to un-publish the address.
