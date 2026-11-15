"use client";

import { Analytics } from "@vercel/analytics/next";
import { dropWhenOptedOut } from "@/analytics-opt-out";

/** Web Analytics for every page, leaving out a browser with the Analytics opt-out set. */
export function SiteAnalytics() {
  // A client component, since a function can't be passed to `Analytics` from the server layout.
  return <Analytics beforeSend={(event) => dropWhenOptedOut(event)} />;
}
