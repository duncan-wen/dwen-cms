# 02: Threads setup wizard

**What to build:** A `/wizard`-generated interactive script that walks the Owner through Meta's one-time setup and ends with a working long-lived token in `.env.local`: create the Meta app with the Threads use case and `threads_basic` and `threads_content_publish`, add themselves as a Threads Tester, accept the invite in Threads, authorise, and exchange the code for a long-lived token. It writes `THREADS_ACCESS_TOKEN`, `THREADS_TOKEN_DATE` and the user ID itself, so the token never passes through the chat. See `../spec.md` and `../research.md`.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] The wizard opens each Meta and Threads page in turn and says what to click
- [x] It exchanges the code for a long-lived token and checks it by reading the account's user ID
- [x] It writes the token, today's date and the user ID into `.env.local` without printing the token
- [x] Running it again replaces the old values
- [x] The Owner has run it and the token works (ticked when the Owner says it finished)

## Comments

- 2026-11-13: The Owner ran the wizard. The token reads @lumpa7223 and matches `THREADS_USER_ID`. Meta's `/apps/creation/` URL 404'd, so the first stage now starts from My Apps; the wizard's text is in Traditional Chinese, at the Owner's request.
