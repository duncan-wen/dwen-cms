import type { Metadata } from "next";
import { LinkRow } from "@/components/link-row";
import { MutedParagraph } from "@/components/muted-paragraph";
import { PageHeading } from "@/components/page-heading";

export const metadata: Metadata = { title: "找不到這個網址" };

export default function NotFound() {
  return (
    <>
      <PageHeading size="page" title="找不到這個網址">
        <MutedParagraph>這個網址沒有任何內容，可能是網址打錯了。從這裡回到文章吧。</MutedParagraph>
      </PageHeading>
      <LinkRow
        links={[
          { href: "/posts", label: "所有文章" },
          { href: "/", label: "回到首頁" },
        ]}
      />
    </>
  );
}
