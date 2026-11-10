"use client";

import { type MouseEvent, type ReactNode, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  /** The original file, which the link opens without JavaScript or on a modified click. */
  src: string;
  alt: string;
  /** What the open Lightbox shows: the Body image again, fitted to the screen. */
  enlarged: ReactNode;
  children: ReactNode;
};

/**
 * Wraps a Body image in a link to its original file, which a click opens in a Lightbox
 * instead: without JavaScript, or on a modified click, the link just goes to the file.
 * The Lightbox mounts on opening, so a closed one fetches nothing, and in `body`, because a
 * Body image sits inside a paragraph. Any click inside it closes it; a pinch isn't a click.
 */
export function Lightbox({ src, alt, enlarged, children }: Props) {
  const [open, setOpen] = useState(false);

  const onClick = (event: MouseEvent) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setOpen(true);
  };

  return (
    <>
      <a
        href={src}
        aria-label={alt ? `放大圖片：${alt}` : "放大圖片"}
        title="放大圖片"
        onClick={onClick}
        className="block w-fit max-w-full cursor-zoom-in"
      >
        {children}
      </a>
      {open && <LightboxDialog label="放大圖片" content={enlarged} onClose={() => setOpen(false)} />}
    </>
  );
}

type DiagramProps = {
  /** What the open Lightbox shows: the Diagram again, fitted to the screen. */
  enlarged: ReactNode;
  /** The Diagram as drawn in the body, inside its own sideways-scrolling box. */
  children: ReactNode;
  scrollClassName: string;
};

/**
 * A Diagram that opens in a Lightbox. A Diagram has no file to link to, and its labels must
 * stay readable by screen readers, so it isn't wrapped in a link or a button: a click on it
 * opens the Lightbox, and the 「放大圖表」 button under it does the same for the keyboard. A
 * Diagram too wide for its box scrolls instead, so only the button opens that one.
 */
export function DiagramLightbox({ enlarged, children, scrollClassName }: DiagramProps) {
  const [open, setOpen] = useState(false);

  const onDiagramClick = (event: MouseEvent<HTMLDivElement>) => {
    const box = event.currentTarget;
    if (box.scrollWidth > box.clientWidth) return;
    setOpen(true);
  };

  return (
    <>
      <div onClick={onDiagramClick} className={`cursor-zoom-in ${scrollClassName}`}>
        {children}
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-1 ml-auto block rounded-full px-3 py-1 text-sm text-ink-soft hover:bg-accent-wash hover:text-ink"
      >
        放大圖表
      </button>
      {open && <LightboxDialog label="放大圖表" content={enlarged} onClose={() => setOpen(false)} />}
    </>
  );
}

/** Outside the component, so it stays one function and runs only when the dialog mounts. */
const openOnMount = (dialog: HTMLDialogElement | null) => dialog?.showModal();

type DialogProps = { label: string; content: ReactNode; onClose: () => void };

/** The Lightbox itself: the content fitted to the screen, closed by any click, Esc or 「關閉」. */
function LightboxDialog({ label, content, onClose }: DialogProps) {
  return createPortal(
    <dialog
      ref={openOnMount}
      aria-label={label}
      onClick={(event) => event.currentTarget.close()}
      onClose={onClose}
      className="m-0 h-dvh max-h-none w-dvw max-w-none cursor-zoom-out bg-paper p-0"
    >
      <div className="flex h-full items-center justify-center px-4 py-14">{content}</div>
      <button
        type="button"
        className="absolute top-3 right-3 rounded-full px-3 py-1 text-sm text-ink-soft hover:bg-accent-wash hover:text-ink"
      >
        關閉
      </button>
    </dialog>,
    document.body,
  );
}
