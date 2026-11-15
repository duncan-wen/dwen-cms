import type { Metadata } from "next";
import { AnalyticsOptOutSwitch } from "@/components/analytics-opt-out-switch";
import { PageHeading } from "@/components/page-heading";

// Only the Owner uses this page: no page links to it, and it stays out of search results and the sitemap.
export const metadata: Metadata = { title: "統計設定", robots: { index: false } };

export default function AnalyticsSettingsPage() {
  return (
    <>
      <PageHeading size="page" title="統計設定" />
      <AnalyticsOptOutSwitch />
    </>
  );
}
