"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
};

/** Native <dialog> with showModal(): focus trap, Escape and inert background for free. */
export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-ui border border-line bg-sheet p-0 text-text backdrop:bg-black/50"
    >
      <div className="flex items-start justify-between gap-4 border-b border-line p-5">
        <h2 id={titleId} className="text-h3">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="flex size-11 shrink-0 items-center justify-center rounded-ui hover:bg-ink-soft"
        >
          <X aria-hidden className="size-5" />
          <span className="sr-only">Fermer la fenêtre</span>
        </button>
      </div>
      <div className="p-5">{children}</div>
      {footer && (
        <div className="flex flex-wrap justify-end gap-3 border-t border-line p-5">{footer}</div>
      )}
    </dialog>
  );
}
