"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useChrome } from "./ChromeContext";
import styles from "./FloatingNav.module.css";

const SHOW_AFTER_PX = 160;

/** Arch-shaped MENU and TOP buttons that appear once the header has scrolled away (prototype). */
export function FloatingNav() {
  const { openMenu } = useChrome();
  const [visible, setVisible] = useState(false);
  const fillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setVisible(y > SHOW_AFTER_PX);
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${Math.min(1, y / max).toFixed(3)})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  function toTop() {
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
    document.getElementById("main")?.focus({ preventScroll: true });
  }

  return (
    <div className={styles.wrap} data-visible={visible || undefined} aria-hidden={!visible || undefined}>
      <button type="button" className={[styles.arch, styles.menu].join(" ")} onClick={openMenu} tabIndex={visible ? 0 : -1} aria-label="Open menu">
        <Icon name="menu" size={22} />
        <span aria-hidden="true">MENU</span>
      </button>
      <button type="button" className={[styles.arch, styles.top].join(" ")} onClick={toTop} tabIndex={visible ? 0 : -1} aria-label="Back to top">
        <span ref={fillRef} className={styles.fill} />
        <span className={styles.topInner}>
          <Icon name="chevron-up" size={22} />
          <span aria-hidden="true">TOP</span>
        </span>
      </button>
    </div>
  );
}
