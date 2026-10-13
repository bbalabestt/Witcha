"use client";

import Link from "next/link";
import { Dialog } from "@/components/ui/Dialog";
import { IconButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import type { MenuItem } from "@/lib/data/types";
import { useChrome } from "./ChromeContext";
import styles from "./MobileMenu.module.css";

type MobileMenuProps = {
  links: MenuItem[];
  accountHref: string;
  tagline: string;
};

/** Full-height left drawer: search first, then links, sign-in, tagline (prototype menu drawer). */
export function MobileMenu({ links, accountHref, tagline }: MobileMenuProps) {
  const { menuOpen, closeMenu, openSearch } = useChrome();
  return (
    <Dialog open={menuOpen} onClose={closeMenu} placement="left" label="Menu">
      <div className={styles.top}>
        <Logo variant="small" width={112} />
        <IconButton label="Close menu" onClick={closeMenu}>
          <Icon name="close" />
        </IconButton>
      </div>
      <div className={styles.body}>
        <button type="button" className={styles.search} onClick={openSearch}>
          <Icon name="search" size={22} />
          Search teas and guides
        </button>
        <nav aria-label="Menu">
          <ul className={styles.links}>
            {links.map((l) => (
              <li key={l.id}>
                <Link href={l.href} className={styles.link} onClick={closeMenu}>
                  <span>{l.title}</span>
                  <Icon name="chevron-right" size={22} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <a href={accountHref} className={styles.account}>
          <Icon name="account" size={22} />
          Sign in
        </a>
        <div className={styles.spacer} />
        <p className={["tagline", styles.tagline].join(" ")}>{tagline}</p>
      </div>
    </Dialog>
  );
}
