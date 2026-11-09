# 03: Drop automated submissions with BotID

**What to build:** Automated submissions to the Owner inbox are dropped on the server before any email is sent, with no CAPTCHA or extra step for a Reader. Vercel BotID runs in the browser on the pages that send to the Owner inbox, and the Owner inbox asks the bot check (passed in, like the transport) before sending; a bot verdict returns `bot` and the Reader sees the same generic failure as `unavailable`. See `../spec.md`.

**Blocked by:** 01

**Status:** done

- [x] BotID's client side protects the Contact form's submission (and is set up so 04's Feedback submissions are covered by adding their route)
- [x] The Owner inbox takes a bot check as a dependency and returns `bot` without sending when it says bot
- [x] vitest covers a bot verdict through the Owner inbox's exports with a fake bot check
- [x] The smoke build and local dev still send through the fake transport (the bot check passes or is faked there, by explicit configuration)
- [x] No CAPTCHA or visible step is added to the form
