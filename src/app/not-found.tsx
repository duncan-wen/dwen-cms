import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "找不到這個網址" };

export default function NotFound() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">找不到這個網址</h1>
      <p className="mt-4 text-lg text-zinc-700">
        這個網址沒有任何內容，可能是網址打錯了。從這裡回到文章吧。
      </p>
      <nav className="mt-10 flex gap-6 font-medium">
        <Link href="/posts" className="hover:underline">
          所有文章 →
        </Link>
        <Link href="/" className="hover:underline">
          回到首頁
        </Link>
      </nav>
    </>
  );
}
