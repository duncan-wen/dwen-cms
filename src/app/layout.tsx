import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Serif_TC } from "next/font/google";
import type { ReactNode } from "react";
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
  title: { default: "Duncan Wen", template: "%s｜Duncan Wen" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant" className={`${serif.variable} ${mono.variable}`}>
      <body className="bg-paper text-ink antialiased">
        <main className="mx-auto max-w-2xl px-4 py-12">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
