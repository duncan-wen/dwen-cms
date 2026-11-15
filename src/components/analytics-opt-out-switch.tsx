"use client";

import { useSyncExternalStore } from "react";
import { isOptedOut, setOptedOut } from "@/analytics-opt-out";
import { buttonClass } from "./button-class";
import { MutedParagraph } from "./muted-paragraph";

const listeners = new Set<() => void>();

/** Hears the switch on this page, and the same switch pressed in another tab. */
const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
};

/** Says whether this device's visits are counted in Web Analytics, with one button to switch. */
export function AnalyticsOptOutSwitch() {
  // The server can't know, so its markup says "counted" until the browser reads its storage.
  const optedOut = useSyncExternalStore(
    subscribe,
    () => isOptedOut(),
    () => false,
  );
  const toggle = () => {
    setOptedOut(!optedOut);
    listeners.forEach((notify) => notify());
  };

  return (
    <div className="grid justify-items-start gap-6">
      <MutedParagraph>
        <span role="status">{optedOut ? "這台裝置的瀏覽不會計入統計。" : "這台裝置的瀏覽會計入統計。"}</span>
        設定存在這個瀏覽器裡，清除瀏覽資料或換一個瀏覽器後要再設定一次。
      </MutedParagraph>
      <button type="button" onClick={toggle} className={buttonClass}>
        {optedOut ? "恢復計入這台裝置" : "不要計入這台裝置"}
      </button>
    </div>
  );
}
