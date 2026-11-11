import styles from "./AnchorNav.module.css";

/** Section links under the buy area, pinned while the page is read. */
export function AnchorNav({ items }: { items: Array<{ id: string; label: string }> }) {
  return (
    <nav aria-label="On this page" className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        {items.map((a) => (
          <a key={a.id} href={`#${a.id}`} className={styles.link}>
            {a.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
