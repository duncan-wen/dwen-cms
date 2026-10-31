import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { siteUrl } from "@/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: { default: "Duncan Wen", template: "%s｜Duncan Wen" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body className="bg-white text-zinc-900 antialiased">
        <main className="mx-auto max-w-2xl px-4 py-12">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
