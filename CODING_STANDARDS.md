# Coding standards

Judgement calls for the reviewer. Lint, typecheck and the content check enforce the mechanical rules.

## Domain language

- Reader-facing text uses the names `GLOSSARY.md` gives under "Shown to readers as" (「文章」 for Post, 「標籤」 for Tag). A term with no Reader-facing name is a glossary gap: resolve it there before shipping the text.
- Code, tests and docs use the glossary's English terms, never its _Avoid_ words.

## Content rules

- A content-check error names the file, the field and the rule, and its advice matches the spec's wording for that rule.
- An error about one entry of a list names that entry: its value, or its position when it has no single value (`Revision 2`).
- Every page, feed and image reads content through the content module's query interface, never from content files directly.

## Tests

- Tests check behaviour through a public interface: the content module's queries and errors, or HTTP responses from the built site.
- Each content rule has its own fixture directory under `src/content/fixtures/` that breaks only that rule, unless the test is about how rules combine.

## Components

- A component's props are a named `type Props`.
