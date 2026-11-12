import Link from "next/link";
import { Seal } from "./seal";
import { SiteNav } from "./site-nav";
import { OWNER_NAME } from "@/site-name";

/** Every page's header: the seal and the Owner's name linking home, then the section links. */
export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-2xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 pt-7">
      <Link href="/" className="flex items-center gap-3 font-serif text-lg font-bold tracking-[0.02em]">
        <Seal className="motion-safe:animate-stamp" />
        {OWNER_NAME}
      </Link>
      <SiteNav />
    </header>
  );
}
