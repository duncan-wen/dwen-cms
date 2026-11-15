import type { BeforeSendEvent } from "@vercel/analytics/next";

const STORAGE_KEY = "analytics-opt-out";

/** The part of `localStorage` the Analytics opt-out uses; a test passes its own. */
export type OptOutStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const browserStorage = () => localStorage;

/** Whether this browser has the Analytics opt-out set; unreadable storage counts as not opted out. */
export function isOptedOut(storage: () => OptOutStorage = browserStorage): boolean {
  try {
    return storage().getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

/** Sets or clears the Analytics opt-out in this browser; storage that refuses the write leaves it as it was. */
export function setOptedOut(optedOut: boolean, storage: () => OptOutStorage = browserStorage): void {
  try {
    if (optedOut) storage().setItem(STORAGE_KEY, "1");
    else storage().removeItem(STORAGE_KEY);
  } catch {
    // Without storage the browser stays counted, and the page goes on saying so.
  }
}

/** Web Analytics' `beforeSend`: drops every event from a browser that has opted out. */
export function dropWhenOptedOut<Event extends BeforeSendEvent>(
  event: Event,
  storage: () => OptOutStorage = browserStorage,
): Event | null {
  return isOptedOut(storage) ? null : event;
}
