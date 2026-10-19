"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { motionAllowed, onFrame } from "@/components/motion/runtime";
import { useShopUI } from "./ShopUI";
import styles from "./FloatingNav.module.css";

/**
 * Floating MENU and TOP controls, shown after 160 px of scroll (when the non-sticky header has gone).
 * MENU is an arch pinned to the top-left corner at every width. TOP is an arch bottom-right on desktop and a
 * compact 48 px pill below 768 px; it moves up when the PDP buy bar is showing and fills with Witcha blue as
 * the page is read.
 */
export function FloatingNav() {
  const { setMenuOpen, stickyBarVisible } = useShopUI();
  const [shown, setShown] = useState(false);
  const fills = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 160);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const stop = onFrame(({ y }) => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const h = `${Math.min(100, (y / max) * 100).toFixed(1)}%`;
      for (const el of fills.current) if (el) el.style.height = h;
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      stop();
    };
  }, []);

  const toTop = () => window.scrollTo({ top: 0, behavior: motionAllowed() ? "smooth" : "auto" });
  const lifted = stickyBarVisible ? styles.lifted : "";

  return (
    <div className={styles.root} data-shown={shown || undefined} aria-hidden={!shown || undefined} inert={!shown}>
      <button type="button" className={`${styles.archMenu} on-primary`} aria-label="Open menu" onClick={() => setMenuOpen(true)}>
        <Icon name="menu" size={22} />
        <span className={styles.archLabel}>Menu</span>
      </button>
      <button type="button" className={`${styles.archTop} ${lifted}`} aria-label="Back to top" onClick={toTop}>
        <span className={styles.fill} ref={(el) => void (fills.current[0] = el)} />
        <span className={styles.archInner}>
          <Icon name="chevron-up" size={22} />
          <span className={styles.archLabel}>Top</span>
        </span>
      </button>

      <div className={`${styles.pill} ${lifted}`}>
        <button type="button" className={`${styles.round} ${styles.roundTop}`} aria-label="Back to top" onClick={toTop}>
          <span className={styles.fill} ref={(el) => void (fills.current[1] = el)} />
          <Icon name="chevron-up" size={22} className={styles.raised} />
        </button>
      </div>
    </div>
  );
}
