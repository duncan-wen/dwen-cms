# 01: Threads share in content

**What to build:** A Post can carry `threads.txt` next to `index.mdx`. The content module reads it into the Post as its Threads share, and the content check holds it to the spec's rules. GLOSSARY gains **Share** as the general term, with **LinkedIn share** and **Threads share** naming only what differs. See `../spec.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A valid `threads.txt` is read into the Post: text, its topic tag, and the `posted:` URL when present
- [ ] The content check rejects, each with its own fixture: over 500 characters; no topic tag or more than one; a tag outside 1–50 characters or containing `.` or `&`; a URL in the text; a malformed `posted:` line
- [ ] Errors name the file, the field and the rule, as the LinkedIn share's do
- [ ] GLOSSARY: **Share**, **LinkedIn share** and **Threads share** entries
- [ ] vitest covers the reading and each rule through the content module's interface
