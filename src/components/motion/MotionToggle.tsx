"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/Icon";
import styles from "./motion.module.css";

const KEY = "wm-motion";
const EVENT = "wm:motion";

function read(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "paused";
  } catch {
    return false;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** WCAG 2.2.2: anything that loops for more than five seconds needs a way to stop it. */
export function MotionToggle({ showText = false }: { showText?: boolean }) {
  const paused = useSyncExternalStore(subscribe, read, () => false);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-motion-paused", paused);
  }, [paused]);

  const label = paused ? "Play animation" : "Pause animation";
  return (
    <button
      type="button"
      className={styles.toggle}
      aria-label={showText ? undefined : label}
      onClick={() => {
        try {
          window.localStorage.setItem(KEY, paused ? "playing" : "paused");
        } catch {
          // Private mode: the choice lasts until the next visit.
        }
        window.dispatchEvent(new Event(EVENT));
      }}
    >
      {paused ? (
        <Icon name="play" size={18} />
      ) : (
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" fill="currentColor">
          <rect x="4" y="3" width="3.5" height="12" />
          <rect x="10.5" y="3" width="3.5" height="12" />
        </svg>
      )}
      {showText ? <span className={styles.toggleText}>{label}</span> : null}
    </button>
  );
}
