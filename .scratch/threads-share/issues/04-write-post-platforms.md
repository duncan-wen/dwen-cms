# 04: write-post asks which platforms

**What to build:** `write-post` drafts `threads.txt` with every new Post, in the Owner's casual voice, opening on the same hook as the title and aiming for 300 characters or fewer, and shows it to the Owner with the Post and the LinkedIn share. Its last step asks 「要發哪些平台？」 (LinkedIn, Threads, both, neither), then previews and posts each chosen platform on the Owner's yes. Sharing an older Post on Threads is one Post at a time on the Owner's request. See `../spec.md`.

**Blocked by:** 01, 03

**Status:** done

- [x] `write-post` has a **Threads share** section next to **LinkedIn share**, written per `writing-for-agents`
- [x] Its steps draft and present `threads.txt` with the Post
- [x] The final step asks which platforms, previews each, and posts only on a yes
- [x] Sharing an older Post on request is covered
- [x] `docs/owner-guide.md` tells the Owner how to ask for a share on each platform
