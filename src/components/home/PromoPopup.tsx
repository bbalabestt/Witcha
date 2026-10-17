"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LinePreview } from "@/components/commerce/CartProvider";
import { useCart } from "@/components/commerce/CartProvider";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import styles from "./PromoPopup.module.css";

const KEY = "wm-promo-seen";

/**
 * Near full-screen promotion that opens once per browser session at 10% of the home page (V4). Behind the
 * PROMO_POPUP flag, off by default: the original brief rules out pop-ups (docs/DEVIATIONS.md). Closes with ✕,
 * "No thanks", the backdrop or Esc.
 */
export function PromoPopup({ set, price }: { set: LinePreview | null; price: string }) {
  const [open, setOpen] = useState(false);
  const { add } = useCart();

  useEffect(() => {
    let seen = "";
    try {
      seen = sessionStorage.getItem(KEY) ?? "";
    } catch {
      seen = "unavailable";
    }
    if (seen) return;
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (window.scrollY / max < 0.1) return;
      window.removeEventListener("scroll", onScroll);
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {
        // Private mode: it may show again next visit.
      }
      setOpen(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Dialog open={open} onClose={() => setOpen(false)} placement="center" label="A letter from the Academy" className={styles.dialog}>
      <div className={styles.panel}>
        <div className={styles.art} role="img" aria-label="The Professor and Charmer sit by matcha bowls, an iced latte and bamboo tools in morning window light.">
          <span className={styles.dates}>Promotion · [dates to confirm]</span>
        </div>
        <div className={styles.copy}>
          <div className={styles.arch} aria-hidden="true" />
          <span className="label">A letter from the Academy</span>
          <h2 className={styles.title}>Meet two keepers at once.</h2>
          <p>
            The Discovery Set pairs a bright tin and a deep tin, so you can taste both ends of the scale. [Offer details to confirm] · {price}
          </p>
          <div className={styles.actions}>
            {set ? (
              <button
                type="button"
                className={`${styles.primary} on-primary`}
                onClick={() => {
                  setOpen(false);
                  void add(set, 1);
                }}
              >
                Add the set
              </button>
            ) : null}
            <Link href="/collections/gifts" className={styles.secondary} onClick={() => setOpen(false)}>
              See all gifts
            </Link>
          </div>
          <button type="button" className="label-link" onClick={() => setOpen(false)}>
            No thanks, keep browsing
          </button>
        </div>
        <button type="button" className={styles.close} aria-label="Close promotion" onClick={() => setOpen(false)}>
          <Icon name="close" />
        </button>
      </div>
    </Dialog>
  );
}
