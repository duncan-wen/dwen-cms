"use client";

import { type Theme, themeStorageKey } from "@/theme";

/** Switches between the light and dark themes and remembers the choice for later visits. */
export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const current: Theme =
      root.dataset.theme === "dark" ||
      (root.dataset.theme !== "light" && matchMedia("(prefers-color-scheme: dark)").matches)
        ? "dark"
        : "light";
    const next: Theme = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem(themeStorageKey, next);
    } catch {
      // Storage blocked: the switch still holds for this page.
    }
  }

  // Both icons render; CSS shows the one for the theme you'd switch to, so the server
  // markup never depends on the Reader's theme.
  return (
    <button
      type="button"
      aria-label="切換深淺色"
      title="切換深淺色"
      onClick={toggle}
      className="grid size-8 flex-none place-items-center rounded-full text-ink-soft hover:bg-accent-wash hover:text-ink"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px] dark:hidden" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
      </svg>
      <svg viewBox="0 0 24 24" aria-hidden="true" className="hidden size-[18px] dark:block" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
      </svg>
    </button>
  );
}
