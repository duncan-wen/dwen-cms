import type { Metadata } from "next";
import { pageTitle } from "@/components/page-styles";
import { TextLink } from "@/components/text-link";

export const metadata: Metadata = { title: "找不到這個網址" };

export default function NotFound() {
  return (
    <>
      <h1 className={`${pageTitle} pt-8`}>找不到這個網址</h1>
      <p className="mt-5 text-[17px] leading-[1.95] text-ink-soft">
        這個網址沒有任何內容，可能是網址打錯了。從這裡回到文章吧。
      </p>
      <nav className="mt-10 flex flex-wrap gap-7">
        <TextLink href="/posts">所有文章</TextLink>
        <TextLink href="/">回到首頁</TextLink>
      </nav>
    </>
  );
}
