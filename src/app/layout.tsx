import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Serif_TC } from "next/font/google";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SITE_NAME } from "@/site-name";
import { siteUrl } from "@/site-url";
import "./globals.css";

// Headings and the seal. CJK glyphs load per unicode-range on demand, so nothing is preloaded.
const serif = Noto_Serif_TC({
  weight: ["700", "900"],
  display: "swap",
  preload: false,
  variable: "--font-noto-serif-tc",
});

// Dates, Tags and code.
const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: { default: SITE_NAME, template: `%s｜${SITE_NAME}` },
  // Proves ownership to Google Search Console (URL-prefix property). The code is public by design.
  // DNS verification can't be used: the subdomain is a CNAME, which can't share its name with a TXT record.
  verification: { google: "vLLljyZQzfxK_tS6sYrs1vl-gOP4oGD7MYCf77xN1MU" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // next-themes' inline script sets data-theme before React hydrates.
    <html lang="zh-Hant" className={`${serif.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col bg-paper text-ink antialiased">
        {/* data-theme on <html> picks the colour tokens in globals.css; with no stored choice it follows the system. */}
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SiteHeader />
          <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">{children}</main>
          <SiteFooter />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
