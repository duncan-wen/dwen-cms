import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Serif_TC } from "next/font/google";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteUrl } from "@/site-url";
import { themeScript } from "@/theme";
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
  title: { default: "Duncan Wen", template: "%s｜Duncan Wen" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // The theme script may set data-theme before React hydrates.
    <html lang="zh-Hant" className={`${serif.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col bg-paper text-ink antialiased">
        <SiteHeader />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">{children}</main>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
