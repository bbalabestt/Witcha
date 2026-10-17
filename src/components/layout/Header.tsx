"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useCart } from "@/components/commerce/CartProvider";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { NAV } from "@/lib/config/site";
import { markerLeft } from "@/lib/data/product";
import { useShopUI } from "./ShopUI";
import styles from "./Header.module.css";

export type MegaTea = { handle: string; title: string; position: number; word: string };

function isActive(pathname: string, href: string): boolean {
  if (href === "/collections/matcha") return pathname.startsWith("/collections/matcha") || pathname.startsWith("/products/");
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

  const left = NAV.slice(0, 3);
  const right = NAV.slice(3);

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
          <span className="label">Shop Matcha</span>
          <Link href="/collections/matcha">All matcha</Link>
          <Link href="/collections/matcha#which-matcha-today">Which Matcha Today?</Link>
          <Link href="/collections/gifts">Gifts &amp; sets</Link>
          <Link href="/collections/accessories">Accessories</Link>
        </div>
        <div className={styles.megaTaste}>
          <span className={styles.megaTasteTitle}>Bright or deep? Pick by taste.</span>
          <div className={styles.megaTrack}>
            {teas.map((t) => (
              <Link
                key={t.handle}
                href={`/products/${t.handle}`}
                className={styles.megaMarker}
                style={{ left: markerLeft(t.position, 17) }}
                aria-label={`${t.title}, ${t.word} ${t.position} of 5`}
              />
            ))}
          </div>
          <div className={styles.ends}>
            <span className="label">Bright</span>
            <span className="label">Deep</span>
          </div>
          <Link href="/collections/matcha" className="label-link">
            Compare the teas
          </Link>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative arch art, sized by CSS */}
        <img
          className={styles.megaArt}
          src="/art/01-professor-key-visual.webp"
          alt="The Professor, a silver-grey cat with a gold scholar brooch, beside a matcha bowl at an arched library window."
          width={820}
          height={820}
          loading="lazy"
        />
      </div>
    </header>
  );
}
