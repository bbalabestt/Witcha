"use client";

import Link from "next/link";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { NAV } from "@/lib/config/site";
import { useShopUI } from "./ShopUI";
import styles from "./MobileMenu.module.css";

/** Full-height drawer: search first, then links. */
export function MobileMenu() {
  const { menuOpen, setMenuOpen, setSearchOpen } = useShopUI();
  return (
    <Dialog open={menuOpen} onClose={() => setMenuOpen(false)} placement="left" label="Menu">
      <div className={styles.head}>
        <Logo variant="small" width={112} />
        <IconButton label="Close menu" onClick={() => setMenuOpen(false)} className={styles.close}>
          <Icon name="close" />
        </IconButton>
      </div>
      <div className={styles.body}>
        <button
          type="button"
          className={styles.search}
          onClick={() => {
            setMenuOpen(false);
            setSearchOpen(true);
          }}
        >
          <Icon name="search" size={22} />
          Search
        </button>
        <nav aria-label="Menu">
          <ul className={styles.links}>
            {NAV.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={styles.link} onClick={() => setMenuOpen(false)}>
                  <span>{l.label}</span>
                  <Icon name="chevron-right" size={22} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.spacer} />
        <p className={`tagline ${styles.tagline}`}>Matcha, With Taste.</p>
      </div>
    </Dialog>
  );
}
