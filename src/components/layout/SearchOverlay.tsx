"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/Button";
import { Button } from "@/components/ui/Button";
import { useShopUI } from "./ShopUI";
import styles from "./SearchOverlay.module.css";

export type PredictiveResult = {
  products: Array<{ handle: string; title: string; eyebrow: string; price: string; tin: { url: string; alt: string } | null }>;
  guides: Array<{ handle: string; title: string; image: { url: string; alt: string } }>;
};

const POPULAR = ["Iced latte", "Yame", "Whisk", "Gift"];

/** Popular searches, predictive results with thumbnails, and a kind no-results state. */
export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useShopUI();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<PredictiveResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const query = q.trim();

  useEffect(() => {
    if (searchOpen) requestAnimationFrame(() => inputRef.current?.focus());
  }, [searchOpen]);

  useEffect(() => {
    if (query.length < 2) return;
    const ctrl = new AbortController();
    const t = window.setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal })
        .then((r) => (r.ok ? (r.json() as Promise<PredictiveResult>) : null))
        .then((data) => data && setResults(data))
        .catch(() => undefined);
    }, 160);
    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
  }, [query]);

  const close = () => {
    setSearchOpen(false);
    setQ("");
    setResults(null);
  };
  const shown = query.length >= 2 ? results : null;
  const hasResults = shown && shown.products.length + shown.guides.length > 0;

  return (
    <Dialog open={searchOpen} onClose={close} placement="top" label="Search">
      <form
        role="search"
        className={styles.bar}
        onSubmit={(e) => {
          e.preventDefault();
          if (!query) return;
          close();
          router.push(`/search?q=${encodeURIComponent(query)}`);
        }}
      >
        <label className={styles.field}>
          <Icon name="search" />
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search teas and guides"
            aria-label="Search teas and guides"
          />
        </label>
        <IconButton label="Close search" onClick={close}>
          <Icon name="close" />
        </IconButton>
      </form>

      <div className={styles.body}>
        {query.length < 2 ? (
          <div className={styles.popular}>
            <span className="label">Popular searches</span>
            <div className={styles.chips}>
              {POPULAR.map((p) => (
                <button key={p} type="button" className={styles.chip} onClick={() => setQ(p)}>
                  {p}
                </button>
              ))}
            </div>
            <p>
              Not sure where to start?{" "}
              <Link href="/collections/matcha" className="text-link" onClick={close}>
                Which Matcha Today?
              </Link>
            </p>
          </div>
        ) : hasResults && shown ? (
          <>
            <div className={styles.seeAll}>
              <Link href={`/search?q=${encodeURIComponent(query)}`} className="label-link" onClick={close}>
                See all results
              </Link>
            </div>
            <div className={styles.columns} aria-live="polite">
              <div className={styles.column}>
                <span className="label">Teas</span>
                {shown.products.map((p) => (
                  <Link key={p.handle} href={`/products/${p.handle}`} className={styles.hit} onClick={close}>
                    <span className={styles.thumb}>
                      {p.tin ? <Image src={p.tin.url} alt="" fill sizes="56px" className={styles.contain} /> : null}
                    </span>
                    <span className={styles.hitText}>
                      <span className="label">{p.eyebrow}</span>
                      <span className="body">{p.title}</span>
                      <span className="body-small">{p.price}</span>
                    </span>
                  </Link>
                ))}
              </div>
              <div className={styles.column}>
                <span className="label">Guides</span>
                {shown.guides.map((g) => (
                  <Link key={g.handle} href={`/blogs/brewing-guides/${g.handle}`} className={styles.hit} onClick={close}>
                    <span className={`${styles.thumb} ${styles.thumbWide}`}>
                      <Image src={g.image.url} alt="" fill sizes="84px" className={styles.cover} />
                    </span>
                    <span className="body">{g.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        ) : shown ? (
          <div className={styles.none} aria-live="polite">
            <p className="heading-3">Nothing for “{query}” yet.</p>
            <p>Try a taste instead: compare our teas from bright to deep, or ask us and we’ll point you to the right tin.</p>
            <div className={styles.actions}>
              <Button href="/collections/matcha" size="md">
                Which Matcha Today?
              </Button>
              <Button href="/pages/contact" variant="secondary" size="md">
                Contact us
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </Dialog>
  );
}
