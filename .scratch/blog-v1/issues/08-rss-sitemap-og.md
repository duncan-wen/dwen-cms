# 08: RSS, sitemap and OG images

**What to build:** Readers can subscribe via RSS, search engines get a sitemap of all Published Posts and Pages, and each Post shared on social media shows a generated preview image with its title. The site's base URL comes from configuration and drives canonical URLs, RSS, sitemap and OG.

**Blocked by:** 02, visual-design/06

**Status:** done

- [x] The RSS feed lists Published Posts, newest first, and no Pages
- [x] The sitemap lists every Published Post, Page and Tag page, and no taken-down Slugs
- [x] Each Post has a generated OG image that renders Traditional Chinese correctly
- [x] Every page sets a canonical URL from the configured base URL
- [x] Smoke tests confirm RSS, sitemap and an OG image are served with the right content types

## Comments

- The OG image draws the Post's generated cover (visual-design/06) behind its title, so a shared link matches the site. A favicon from the 「溫」 seal fits here too.
- Built: `/feed.xml` (the `feed` package), `sitemap.ts`, `posts/[slug]/opengraph-image.tsx` (static per Published Post) and `icon.tsx` (the seal). Build-time images draw Noto Serif TC fetched from Google Fonts subset to the title's glyphs, so `next build` needs network access, as it already does for `next/font/google`; their colours are read from the light `:root` tokens in `globals.css`. `pnpm smoke` builds with `SITE_URL=https://dwen.example` to prove canonical, RSS, sitemap and OG URLs follow the configured base URL. `SITE_URL` is already set on Vercel Production.
