"use client";

import { motionAllowed } from "@/components/motion/runtime";
import styles from "./AnchorNav.module.css";

/** Desktop section links under the gallery (sticky at the top: the header is not sticky). */
export function AnchorNav({ items }: { items: Array<{ id: string; label: string }> }) {
  return (
    <nav aria-label="On this page" className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        {items.map((a) => (
          <a
            key={a.id}
            href={`#${a.id}`}
            className={styles.link}
            onClick={(e) => {
              const el = document.getElementById(a.id);
              if (!el) return;
              e.preventDefault();
              window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: motionAllowed() ? "smooth" : "auto" });
              history.replaceState(history.state, "", `#${a.id}`);
            }}
          >
            {a.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
