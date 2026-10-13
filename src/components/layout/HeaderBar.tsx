"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { TasteScale, type TasteMarker } from "@/components/commerce/TasteScale";
import { IconButton } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/Frame";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import type { MenuItem } from "@/lib/data/types";
import { useChrome } from "./ChromeContext";
import { RouteChange } from "./RouteChange";
import styles from "./Header.module.css";

export function isActive(pathname: string, item: MenuItem): boolean {
  const path = item.href.split(/[?#]/)[0] ?? "";
  if (!path || path === "/") return pathname === "/";
  if (pathname === path || pathname.startsWith(`${path}/`)) return true;
  // Shop Matcha stays underlined on product pages and on its own children.
  if (item.items.length && pathname.startsWith("/products/")) return true;
  return item.items.some((c) => (c.href.split(/[?#]/)[0] ?? "") === pathname);
}

type HeaderBarProps = {
  nav: MenuItem[];
  teaMarkers: TasteMarker[];
  cart: ReactNode;
};

export function HeaderBar({ nav, teaMarkers, cart }: HeaderBarProps) {
  // The active underline is set after mount (and on navigation), so the header itself never sits
  // in a Suspense boundary and hydrates with the page.
  const [pathname, setPathname] = useState("");
  useEffect(() => {
    const t = window.setTimeout(() => setPathname(window.location.pathname), 0);
    return () => window.clearTimeout(t);
  }, []);
  const { openMenu, openSearch } = useChrome();
  const [megaOpen, setMegaOpen] = useState(false);
  const megaId = useId();
  const barRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const left = nav.slice(0, 3);
  const right = nav.slice(3);


  useEffect(() => {
    if (!megaOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMegaOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setMegaOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [megaOpen]);

  const renderItem = (item: MenuItem) => {
    const active = isActive(pathname, item) || (item.items.length > 0 && megaOpen);
    if (item.items.length) {
      return (
        <button
          key={item.id}
          ref={triggerRef}
          type="button"
          className={styles.navItem}
          data-active={active || undefined}
          aria-expanded={megaOpen}
          aria-controls={megaId}
          onClick={() => setMegaOpen((o) => !o)}
        >
          {item.title}
          <Icon name="chevron-down" size={16} className={megaOpen ? styles.chevronOpen : undefined} />
        </button>
      );
    }
    return (
      <Link key={item.id} href={item.href} className={styles.navItem} data-active={active || undefined} aria-current={pathname === item.href ? "page" : undefined}>
        {item.title}
      </Link>
    );
  };

  const megaItem = nav.find((i) => i.items.length);

  return (
    <div ref={barRef} className={styles.wrap}>
      <RouteChange
        onChange={(p) => {
          setPathname(p);
          setMegaOpen(false);
        }}
      />
      <div className={styles.bar}>
        <div className={styles.side}>
          <IconButton label="Open menu" className={styles.narrowOnly} onClick={openMenu}>
            <Icon name="menu" />
          </IconButton>
          <nav aria-label="Main" className={styles.nav}>
            {left.map(renderItem)}
          </nav>
        </div>

        <Link href="/" className={styles.logoLink} aria-label="WITCHA MATCHA home">
          <Logo variant="large" width={200} className={styles.logo} />
        </Link>

        <div className={[styles.side, styles.end].join(" ")}>
          <nav aria-label="More" className={styles.nav}>
            {right.map(renderItem)}
          </nav>
          <div className={styles.utilities}>
            <IconButton label="Search" onClick={openSearch}>
              <Icon name="search" />
            </IconButton>
            {cart}
          </div>
        </div>
      </div>

      {megaItem ? (
        <div id={megaId} className={styles.mega} hidden={!megaOpen}>
          <div className={styles.megaLinks}>
            <span className="label">{megaItem.title}</span>
            {megaItem.items.map((c) => (
              <Link key={c.id} href={c.href} className={styles.megaLink} onClick={() => setMegaOpen(false)}>
                {c.title}
              </Link>
            ))}
          </div>
          <div className={styles.megaTaste}>
            <p className="heading-3">Bright or deep? Pick by taste.</p>
            {teaMarkers.length ? <TasteScale size="panel" markers={teaMarkers} /> : null}
            <Link href="/collections/matcha" className={styles.megaCta} onClick={() => setMegaOpen(false)}>
              Compare the teas
            </Link>
          </div>
          <ImagePlaceholder label="Character art · pending artist" shape="arch" showRatio={false} className={styles.megaArt} />
        </div>
      ) : null}
    </div>
  );
}
