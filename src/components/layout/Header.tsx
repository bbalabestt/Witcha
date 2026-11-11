"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useCart } from "@/components/commerce/CartProvider";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { WhiskedBowl } from "@/components/motion/MatchaScenes";
import { NAV, TEAS_HREF } from "@/lib/config/site";
import { useShopUI } from "./ShopUI";
import styles from "./Header.module.css";

export type MegaTea = { handle: string; title: string };

function isActive(pathname: string, href: string): boolean {
  if (href === TEAS_HREF) return pathname.startsWith(TEAS_HREF) || pathname.startsWith("/products/");
  return pathname.startsWith(href);
}

/**
 * Not sticky, no compact state (V4 1.1): once it scrolls away the floating MENU / TOP controls take over.
 * Below 1200 px the inline navigation collapses to the menu button.
 */
export function Header({ teas }: { teas: MegaTea[] }) {
  const pathname = usePathname();
  const { setMenuOpen, setSearchOpen } = useShopUI();
  const { cart, ready, setOpen } = useCart();
  const [megaOpen, setMegaOpen] = useState(false);
  const megaId = useId();
  const headerRef = useRef<HTMLElement>(null);
  const count = cart?.totalQuantity ?? 0;
  const [shownPath, setShownPath] = useState(pathname);

  if (shownPath !== pathname) {
    setShownPath(pathname);
    setMegaOpen(false);
  }

  useEffect(() => {
    if (!megaOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMegaOpen(false);
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setMegaOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [megaOpen]);

  const left = NAV.slice(0, 1);
  const right = NAV.slice(1);

  const navItem = (item: (typeof NAV)[number]) => {
    const active = isActive(pathname, item.href) || ("mega" in item && megaOpen);
    if ("mega" in item) {
      return (
        <button
          key={item.href}
          type="button"
          className={styles.navItem}
          aria-expanded={megaOpen}
          aria-controls={megaId}
          onClick={() => setMegaOpen((o) => !o)}
        >
          <span className={styles.underline} data-active={active || undefined} />
          {item.label}
          <Icon name="chevron-down" size={16} />
        </button>
      );
    }
    return (
      <Link key={item.href} href={item.href} className={styles.navItem} aria-current={active ? "page" : undefined}>
        <span className={styles.underline} data-active={active || undefined} />
        {item.label}
      </Link>
    );
  };

  return (
    <header ref={headerRef} className={styles.header}>
      <div className={styles.row}>
        <div className={styles.side}>
          <button type="button" className={styles.menuButton} aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            <Icon name="menu" />
          </button>
          <nav aria-label="Primary" className={styles.nav}>
            {left.map(navItem)}
          </nav>
        </div>
        <Link href="/" aria-label="WITCHA MATCHA home" className={styles.logoLink}>
          <Logo variant="large" width={200} className={styles.logo} />
        </Link>
        <div className={`${styles.side} ${styles.sideRight}`}>
          <nav aria-label="Secondary" className={styles.nav}>
            {right.map(navItem)}
          </nav>
          <div className={styles.utilities}>
            <button type="button" className={styles.utility} aria-label="Search" onClick={() => setSearchOpen(true)}>
              <Icon name="search" />
            </button>
            <button
              type="button"
              className={styles.utility}
              aria-label={ready && count > 0 ? `Cart, ${count} item${count === 1 ? "" : "s"}` : "Cart"}
              onClick={() => setOpen(true)}
            >
              <Icon name="cart" />
              {ready && count > 0 ? (
                <span className={styles.count} aria-hidden="true">
                  {count}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </div>

      <div id={megaId} className={styles.mega} hidden={!megaOpen}>
        <div className={styles.megaLinks}>
          <span className="label">Shop the teas</span>
          {teas.map((t) => (
            <Link key={t.handle} href={`/products/${t.handle}`}>
              {t.title}
            </Link>
          ))}
        </div>
        <div className={styles.megaTaste}>
          <span className={styles.megaTasteTitle}>Which Matcha Today?</span>
          <p className="body-small">Each tea has a clear character. Choose by flavour, or by how you like to drink it.</p>
          <Link href={TEAS_HREF} className="label-link">
            Japanese matcha and hojicha
          </Link>
        </div>
        <div className={styles.megaArt} aria-hidden="true">
          <WhiskedBowl />
        </div>
      </div>
    </header>
  );
}
