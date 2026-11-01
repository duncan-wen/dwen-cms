import type { Metadata } from "next";
import { PageHeading } from "@/components/page-heading";
import { TextLink } from "@/components/text-link";

export const metadata: Metadata = { title: "找不到這個網址" };

export default function NotFound() {
  return (
    <>
      <PageHeading size="page" title="找不到這個網址">
        <p className="text-[17px] leading-[1.95] text-ink-soft">
          這個網址沒有任何內容，可能是網址打錯了。從這裡回到文章吧。
        </p>
      </PageHeading>
      <nav className="flex flex-wrap gap-7">
        <TextLink href="/posts">所有文章</TextLink>
        <TextLink href="/">回到首頁</TextLink>
      </nav>
    </>
  );
}
