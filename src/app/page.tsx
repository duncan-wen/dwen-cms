import type { Metadata } from "next";
import { LinkRow } from "@/components/link-row";
import { PostGrid } from "@/components/post-grid";
import { Seal } from "@/components/seal";
import { TextLink } from "@/components/text-link";
import { getContent } from "@/content/site-content";
import { pageAlternates } from "@/page-alternates";

export const metadata: Metadata = { alternates: pageAlternates("/") };

/** How many of the newest Posts the home page shows: one lead and two rows of two. */
const LATEST_COUNT = 5;

export default async function HomePage() {
  const latest = (await getContent()).listPublishedPosts().slice(0, LATEST_COUNT);
  return (
    <>
      {/*
        The headline ends in the seal like a signature: set vertically on the right from 640px, horizontally on phones.
        From 640px the space above the introduction is a sheet of manuscript paper on the headline's scale: --headline-glyph is its font size, --headline-tracking its letter spacing in em.
      */}
      <section className="grid gap-8 pt-4 pb-16 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end sm:gap-12 sm:pt-8 sm:pb-20 sm:[--headline-glyph:clamp(40px,5.4vw,54px)] sm:[--headline-tracking:0.14]">
        <h1 className="text-[34px] leading-[1.35] font-black tracking-[0.02em] sm:order-3 sm:flex sm:flex-col sm:items-start sm:pl-2 sm:text-(length:--headline-glyph) sm:leading-normal sm:tracking-[calc(var(--headline-tracking)*1em)] sm:[writing-mode:vertical-rl]">
          <span className="block">
            把<span className="sm:[text-combine-upright:all]">AI</span>做進真的產品裡
          </span>
          <span className="block">
            再把過程寫下來
            <span className="ml-3 inline-block align-middle tracking-normal sm:mt-4 sm:ml-0 sm:align-baseline sm:[writing-mode:horizontal-tb]">
              <Seal size="large" />
            </span>
          </span>
        </h1>
        <span aria-hidden="true" className="hidden self-stretch border-l border-rule sm:order-2 sm:block" />
        <div className="grid gap-6 sm:order-1 sm:grid-rows-[1fr_auto_auto_auto] sm:self-stretch sm:pb-2">
          <div aria-hidden="true" className="manuscript hidden sm:block" />
          <p className="font-serif text-[21px] leading-[1.6] font-bold">
            我是 Duncan Wen，一名軟體工程師，專注在網頁開發與 AI 應用。
          </p>
          <p className="max-w-[22em] text-ink-soft">這裡記錄我的做法、踩過的坑，和每個取捨背後的理由。</p>
          <LinkRow
            links={[
              { href: "/about", label: "關於我" },
              { href: "/about#contact", label: "聯絡我" },
            ]}
          />
        </div>
      </section>
      <section>
        <div className="flex items-baseline justify-between gap-4 border-b border-rule pb-3.5">
          <h2 className="text-[21px] font-bold">最新文章</h2>
          <span className="text-[15px]">
            <TextLink href="/posts">所有文章</TextLink>
          </span>
        </div>
        <PostGrid posts={latest} />
      </section>
    </>
  );
}
