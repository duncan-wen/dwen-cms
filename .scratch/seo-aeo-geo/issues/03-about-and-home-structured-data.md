# 03: About and home page structured data

**What to build:** The About Page carries `ProfilePage` JSON-LD whose main entity is the Owner as a `Person`, and the home page carries `WebSite` JSON-LD naming the site, both built with the module from 02. See `../spec.md`.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] The About Page has a `ProfilePage` whose `mainEntity` is a `Person` "Duncan Wen" with the About Page URL and `sameAs` exactly the GitHub and LinkedIn URLs, read from the site's contact links
- [ ] No `image` on the `Person`
- [ ] The home page has a `WebSite` with `name` from the site-name constant and the home page URL; no `alternateName`, no `SearchAction`
- [ ] Smoke covers both
