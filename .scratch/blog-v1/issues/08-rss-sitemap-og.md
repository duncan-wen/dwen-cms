# 08: RSS, sitemap and OG images

**What to build:** Readers can subscribe via RSS, search engines get a sitemap of all Published Posts and Pages, and each Post shared on social media shows a generated preview image with its title. The site's base URL comes from configuration and drives canonical URLs, RSS, sitemap and OG.

**Blocked by:** 02, visual-design/06

**Status:** ready-for-agent

- [ ] The RSS feed lists Published Posts, newest first, and no Pages
- [ ] The sitemap lists every Published Post, Page and Tag page, and no taken-down Slugs
- [ ] Each Post has a generated OG image that renders Traditional Chinese correctly
- [ ] Every page sets a canonical URL from the configured base URL
- [ ] Smoke tests confirm RSS, sitemap and an OG image are served with the right content types

## Comments

- The OG image draws the Post's generated cover (visual-design/06) behind its title, so a shared link matches the site. A favicon from the 「溫」 seal fits here too.
