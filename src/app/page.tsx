import { PostGrid } from "@/components/post-grid";
import { Seal } from "@/components/seal";
import { TextLink } from "@/components/text-link";
import { getContent } from "@/content/site-content";

/** How many of the newest Posts the home page shows: one lead and two rows of two. */
const LATEST_COUNT = 5;

export default async function HomePage() {
  const latest = (await getContent()).listPublishedPosts().slice(0, LATEST_COUNT);
  return (
    <>
      {/* From 640px the headline is set vertically on the right, ending in the seal like a signature. */}
      <section className="grid gap-8 pt-4 pb-16 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end sm:gap-12 sm:pt-8 sm:pb-20">
        <h1 className="text-[34px] leading-[1.35] font-black tracking-[0.02em] sm:order-3 sm:flex sm:flex-col sm:items-start sm:pl-2 sm:text-[clamp(40px,5.4vw,54px)] sm:leading-normal sm:tracking-[0.14em] sm:[writing-mode:vertical-rl]">
          <span className="block">
            把<span className="sm:[text-combine-upright:all]">AI</span>做進真的產品裡
          </span>
          <span className="block">
            再把過程寫下來
            <span className="hidden tracking-normal sm:mt-4 sm:inline-block sm:[writing-mode:horizontal-tb]">
              <Seal size="large" />
            </span>
          </span>
        </h1>
        <span aria-hidden="true" className="hidden self-stretch border-l border-rule sm:order-2 sm:block" />
        <div className="grid gap-6 sm:order-1 sm:pb-2">
          <p className="font-serif text-[21px] leading-[1.6] font-bold">
            我是 Duncan Wen，一名軟體工程師，專注在網頁開發與 AI 應用。
          </p>
          <p className="max-w-[22em] text-ink-soft">這裡記錄我的做法、踩過的坑，和每個取捨背後的理由。</p>
          <p className="flex flex-wrap gap-7">
            <TextLink href="/about">關於我</TextLink>
            <TextLink href="/about#contact">聯絡我</TextLink>
          </p>
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
