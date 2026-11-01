/**
 * Noto Serif TC, the site's heading and seal face, for images drawn at build time
 * (the OG images and the icon). Their renderer needs the font file itself and can't
 * read WOFF2, so this asks Google Fonts for a TrueType file holding only the glyphs
 * in `text`: a few kilobytes instead of the full Traditional Chinese set. Like
 * `next/font/google`, it needs network access at build time.
 */
export async function serifFont(weight: 700 | 900, text: string) {
  const query = new URLSearchParams({ family: `Noto Serif TC:wght@${weight}`, text });
  const css = await (await fetch(`https://fonts.googleapis.com/css2?${query}`)).text();
  const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
  if (!url) throw new Error(`Google Fonts sent no TrueType Noto Serif TC ${weight}:\n${css}`);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Couldn't download Noto Serif TC ${weight}: ${response.status}`);
  return {
    name: "Noto Serif TC",
    data: await response.arrayBuffer(),
    weight,
    style: "normal" as const,
  };
}
