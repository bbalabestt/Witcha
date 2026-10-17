"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import styles from "./ConsentBanner.module.css";

const KEY = "wm-consent";

/** Null when no choice is stored; storage errors (private mode) count as "decided" so the banner never nags. */
function readChoice(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return "unavailable";
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

/** Equal-weight choices, so neither is nudged. Essential cookies (the cart) need no consent. */
export function ConsentBanner() {
  const stored = useSyncExternalStore(subscribe, readChoice, () => "server");
  const [chosen, setChosen] = useState(false);

  if (stored !== null || chosen) return null;

  const choose = (value: "essential" | "all") => {
    try {
      window.localStorage.setItem(KEY, value);
    } catch {
      // Private mode: the choice lasts for this page only.
    }
    window.dispatchEvent(new CustomEvent("wm:consent", { detail: value }));
    setChosen(true);
  };

  return (
    <div className={styles.wrap}>
      <section className={styles.banner} aria-label="Cookie preferences">
        <p className={styles.text}>
          We use essential cookies to run the shop and keep your cart. With your OK, we also measure which pages help.{" "}
          <Link href="/policies/privacy-policy" className="text-link">
            Privacy Policy
          </Link>
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={() => choose("essential")}>
            Essential only
          </button>
          <button type="button" className={`${styles.primary} on-primary`} onClick={() => choose("all")}>
            Accept
          </button>
        </div>
      </section>
    </div>
  );
}
