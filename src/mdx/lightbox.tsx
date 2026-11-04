"use client";

import Image from "next/image";
import { type MouseEvent, type ReactNode, useState } from "react";
import { createPortal } from "react-dom";

type Props = { src: string; alt: string; width: number; height: number; children: ReactNode };

/** Outside the component, so it stays one function and runs only when the dialog mounts. */
const openOnMount = (dialog: HTMLDialogElement | null) => dialog?.showModal();

/**
 * Wraps a Body image in a link to its original file, which a click opens in a Lightbox
 * instead: without JavaScript, or on a modified click, the link just goes to the file.
 * The Lightbox mounts on opening, so a closed one fetches nothing, and in `body`, because a
 * Body image sits inside a paragraph. Any click inside it closes it; a pinch isn't a click.
 */
export function Lightbox({ src, alt, width, height, children }: Props) {
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
        className="block w-fit cursor-zoom-in"
      >
        {children}
      </a>
      {open &&
        createPortal(
          <dialog
            ref={openOnMount}
            aria-label="放大圖片"
            onClick={(event) => event.currentTarget.close()}
            onClose={() => setOpen(false)}
            className="m-0 h-dvh max-h-none w-dvw max-w-none cursor-zoom-out bg-paper p-0"
          >
            <div className="flex h-full items-center justify-center px-4 py-14">
              <Image
                unoptimized
                src={src}
                alt={alt}
                width={width}
                height={height}
                className="h-auto max-h-full w-auto max-w-full rounded-md dark:brightness-[.85]"
              />
            </div>
            <button
              type="button"
              className="absolute top-3 right-3 rounded-full px-3 py-1 text-sm text-ink-soft hover:bg-accent-wash hover:text-ink"
            >
              關閉
            </button>
          </dialog>,
          document.body,
        )}
    </>
  );
}
