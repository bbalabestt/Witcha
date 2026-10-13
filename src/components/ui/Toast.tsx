"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { Icon } from "./Icon";
import styles from "./Toast.module.css";

export type ToastTone = "info" | "success" | "error";
type ToastItem = { id: number; message: string; tone: ToastTone };
type ToastApi = { show: (message: string, tone?: ToastTone) => void };

const ToastContext = createContext<ToastApi | null>(null);

const DURATION_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => setItems((all) => all.filter((t) => t.id !== id)), []);

  const show = useCallback(
    (message: string, tone: ToastTone = "info") => {
      const id = ++seq.current;
      setItems((all) => [...all.slice(-2), { id, message, tone }]);
      // Errors stay until dismissed so they can be read and acted on.
      if (tone !== "error") window.setTimeout(() => dismiss(id), DURATION_MS);
    },
    [dismiss],
  );

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className={styles.region} role="status" aria-live="polite" aria-atomic="false">
        {items.map((t) => (
          <div key={t.id} className={[styles.toast, t.tone === "error" ? styles.error : undefined].filter(Boolean).join(" ")}>
            <Icon name={t.tone === "error" ? "alert" : t.tone === "success" ? "check" : "info"} size={20} />
            <span className={styles.message}>{t.message}</span>
            <button type="button" className={styles.dismiss} aria-label="Dismiss" onClick={() => dismiss(t.id)}>
              <Icon name="close" size={18} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
