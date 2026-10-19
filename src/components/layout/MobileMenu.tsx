"use client";

import Link from "next/link";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { NAV } from "@/lib/config/site";
import { useShopUI } from "./ShopUI";
import styles from "./MobileMenu.module.css";

const LINKS = [...NAV.map((n) => ({ href: n.href, label: n.label })), { href: "/pages/faq", label: "Help & FAQ" }];

/** Full-height drawer: search first, then links, then sign in (Shopify-hosted). */
export function MobileMenu({ accountUrl }: { accountUrl: string }) {
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
          Search teas and guides
        </button>
        <nav aria-label="Menu">
          <ul className={styles.links}>
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={styles.link} onClick={() => setMenuOpen(false)}>
                  <span>{l.label}</span>
                  <Icon name="chevron-right" size={22} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <a href={accountUrl} className={styles.account}>
          <Icon name="account" size={22} />
          Sign in <span className="body-small">(Shopify-hosted)</span>
        </a>
        <div className={styles.spacer} />
        <p className={`tagline ${styles.tagline}`}>Matcha, With Taste.</p>
      </div>
    </Dialog>
  );
}
