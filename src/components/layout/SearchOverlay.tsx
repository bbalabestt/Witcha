"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Button, IconButton } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { MediaThumb } from "@/components/ui/MediaThumb";
import type { PredictivePayload } from "@/lib/data/search-hit";
import { useChrome } from "./ChromeContext";
import styles from "./SearchOverlay.module.css";

export const POPULAR_SEARCHES = ["Iced latte", "Yame", "Whisk", "Gift"];
const DEBOUNCE_MS = 200;

type Status = "idle" | "loading" | "done" | "error";

export function SearchOverlay() {
  const { searchOpen, closeSearch } = useChrome();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [results, setResults] = useState<PredictivePayload | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const statusId = useId();
  const trimmed = q.trim();

  // Fresh field each time it opens.
  const [wasOpen, setWasOpen] = useState(searchOpen);
  if (wasOpen !== searchOpen) {
    setWasOpen(searchOpen);
    if (searchOpen) {
      setQ("");
      setResults(null);
      setStatus("idle");
    }
  }

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (trimmed.length < 2) return;
    const ctrl = new AbortController();
    const t = window.setTimeout(async () => {
      setStatus("loading");
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error(String(res.status));
        setResults((await res.json()) as PredictivePayload);
        setStatus("done");
      } catch (err) {
        if ((err as Error).name !== "AbortError") setStatus("error");
      }
    }, DEBOUNCE_MS);
    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
  }, [trimmed]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (trimmed.length < 2) return;
    closeSearch();
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  const showResults = trimmed.length >= 2 && results !== null && results.query.toLowerCase() === trimmed.toLowerCase();
  const hits = showResults ? results.products.length + results.articles.length : 0;
  const announce =
    trimmed.length < 2 ? "" : status === "loading" ? "Searching" : status === "error" ? "Search is unavailable" : showResults ? `${hits} ${hits === 1 ? "result" : "results"}` : "";

  return (
    <Dialog open={searchOpen} onClose={closeSearch} placement="top" label="Search">
      <form role="search" className={styles.bar} onSubmit={submit}>
        <label className={styles.field}>
          <Icon name="search" />
          <span className="visually-hidden">Search teas and guides</span>
          <input
            ref={inputRef}
            type="search"
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search teas and guides"
            autoComplete="off"
            enterKeyHint="search"
            aria-describedby={statusId}
          />
        </label>
        <IconButton label="Close search" onClick={closeSearch}>
          <Icon name="close" />
        </IconButton>
      </form>

      <div className={styles.panel} aria-busy={status === "loading" || undefined}>
        <p id={statusId} className="visually-hidden" aria-live="polite">
          {announce}
        </p>

        {trimmed.length < 2 ? (
          <div className={styles.stack}>
            <span className="label">Popular searches</span>
            <div className={styles.chips}>
              {POPULAR_SEARCHES.map((p) => (
                <button key={p} type="button" className={styles.chip} onClick={() => setQ(p)}>
                  {p}
                </button>
              ))}
            </div>
            <p>
              Not sure where to start?{" "}
              <Link href="/collections/matcha" onClick={closeSearch}>
                Which Matcha Today?
              </Link>
            </p>
          </div>
        ) : status === "error" ? (
          <div className={styles.stack}>
            <p className="heading-3">Search is having a moment.</p>
            <p>Try again, or browse the teas from bright to deep.</p>
          </div>
        ) : showResults && hits > 0 ? (
          <div className={styles.columns}>
            <div className={styles.stack}>
              <span className="label">Teas</span>
              {results.products.length ? (
                results.products.map((p) => (
                  <Link key={p.handle} href={`/products/${p.handle}`} className={styles.hit} onClick={closeSearch}>
                    <MediaThumb media={p.media} ratio="4:5" width={56} />
                    <span className={styles.hitText}>
                      <span className={styles.eyebrow}>{p.eyebrow}</span>
                      <span>{p.title}</span>
                      <span className={styles.small}>{p.price}</span>
                    </span>
                  </Link>
                ))
              ) : (
                <p className={styles.small}>No teas match.</p>
              )}
            </div>
            <div className={styles.stack}>
              <span className="label">Guides</span>
              {results.articles.length ? (
                results.articles.map((a) => (
                  <Link key={a.handle} href={`/blogs/${a.blogHandle}/${a.handle}`} className={styles.hit} onClick={closeSearch}>
                    <MediaThumb media={a.media} ratio="3:2" width={84} />
                    <span>{a.title}</span>
                  </Link>
                ))
              ) : (
                <p className={styles.small}>No guides match.</p>
              )}
            </div>
            <Link href={`/search?q=${encodeURIComponent(trimmed)}`} className={styles.all} onClick={closeSearch}>
              See all results for “{trimmed}”
            </Link>
          </div>
        ) : showResults ? (
          <div className={[styles.stack, styles.none].join(" ")}>
            <p className="heading-3">Nothing for “{trimmed}” yet.</p>
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
