"use client";

import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from "react";
import { Icon } from "./Icon";
import { IconButton } from "./Button";
import styles from "./Dialog.module.css";

export type DialogPlacement = "right" | "left" | "top" | "center";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  placement?: DialogPlacement;
  /** Visible title in the standard header. Omit and pass `label` to render your own header. */
  title?: ReactNode;
  label?: string;
  closeLabel?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Native modal <dialog>: the rest of the page is inert (focus trap), Esc closes, and focus returns to
 * the element that opened it. The page behind is scroll-locked while open.
 */
export function Dialog({ open, onClose, placement = "right", title, label, closeLabel = "Close", children, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      returnTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      el.showModal();
      document.documentElement.classList.add("wm-scroll-locked");
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onClosed = () => {
      document.documentElement.classList.remove("wm-scroll-locked");
      returnTo.current?.focus();
      returnTo.current = null;
    };
    el.addEventListener("close", onClosed);
    return () => {
      el.removeEventListener("close", onClosed);
      document.documentElement.classList.remove("wm-scroll-locked");
    };
  }, []);

  function onBackdropClick(e: MouseEvent<HTMLDialogElement>) {
    const el = ref.current;
    if (!el || e.target !== el) return;
    const r = el.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) onClose();
  }

  return (
    <dialog
      ref={ref}
      className={[styles.dialog, styles[placement], className].filter(Boolean).join(" ")}
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : label}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={onBackdropClick}
    >
      {title ? (
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <IconButton label={closeLabel} onClick={onClose} className={styles.close}>
            <Icon name="close" />
          </IconButton>
        </div>
      ) : null}
      <div className={styles.body}>{children}</div>
    </dialog>
  );
}
