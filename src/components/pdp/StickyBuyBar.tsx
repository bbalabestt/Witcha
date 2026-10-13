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
    const target = document.querySelector("[data-atc-main]");
    if (!target) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      setVisible(!entry.isIntersecting && entry.boundingClientRect.bottom < 60);
    }, { rootMargin: "-60px 0px 0px 0px" });
    io.observe(target);
    return () => io.disconnect();
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
