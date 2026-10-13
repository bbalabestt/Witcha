"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { MediaThumb } from "@/components/ui/MediaThumb";
import { formatMoney } from "@/lib/data/money";
import { useAddToCart } from "./BuyBox";
import { usePdp } from "./PdpContext";
import styles from "./Pdp.module.css";

/** Appears once the main Add to cart row scrolls above the viewport (available sizes only). */
export function StickyBuyBar() {
  const { product, variant } = usePdp();
  const { state, add } = useAddToCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Scroll check rather than IntersectionObserver: a jump from below the row to above it
    // (fast scroll, anchor link, restored position) never "intersects", so IO would miss it.
    let frame = 0;
    const check = () => {
      frame = 0;
      const target = document.querySelector("[data-atc-main]");
      setVisible(Boolean(target && target.getBoundingClientRect().bottom < 60));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [variant.id]);

  const show = visible && variant.availableForSale;

  // Lift the floating MENU/TOP buttons above the bar.
  useEffect(() => {
    const root = document.documentElement;
    if (show) root.style.setProperty("--float-bottom", "92px");
    else root.style.removeProperty("--float-bottom");
    return () => {
      root.style.removeProperty("--float-bottom");
    };
  }, [show]);

  return (
    <div className={styles.sticky} data-visible={show || undefined} aria-hidden={!show || undefined}>
      <MediaThumb media={product.media[0] ?? null} ratio="4:5" width={40} />
      <span className={styles.stickyText}>
        <span className={styles.stickyName}>{product.title}</span>
        <span className={styles.small}>
          {variant.size} · {formatMoney(variant.price)}
        </span>
      </span>
      <Button size="lg" onClick={add} tabIndex={show ? 0 : -1} status={state === "loading" ? "loading" : state === "added" ? "success" : "idle"} disabled={state === "loading"}>
        {state === "loading" ? "Adding…" : state === "added" ? "Added" : "Add to cart"}
      </Button>
    </div>
  );
}
