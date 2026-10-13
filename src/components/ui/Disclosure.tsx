"use client";

import Link from "next/link";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Icon } from "./Icon";
import { nextIndex } from "./Controls";
import styles from "./Disclosure.module.css";

/* ---------- Accordion ---------- */

export function toggleOpen(open: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(open);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

export type AccordionItem = { id: string; title: string; content: ReactNode };

export function Accordion({ items, defaultOpen = [] }: { items: AccordionItem[]; defaultOpen?: string[] }) {
  const base = useId();
  const [open, setOpen] = useState<Set<string>>(() => new Set(defaultOpen));
  return (
    <div className={styles.accordion}>
      {items.map((item) => {
        const isOpen = open.has(item.id);
        const triggerId = `${base}-${item.id}-t`;
        const panelId = `${base}-${item.id}-p`;
        return (
          <div key={item.id} className={styles.item}>
            <h3>
              <button
                type="button"
                id={triggerId}
                className={styles.trigger}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen((s) => toggleOpen(s, item.id))}
              >
                <span>{item.title}</span>
                <Icon name={isOpen ? "minus" : "plus"} />
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={triggerId} hidden={!isOpen} className={styles.panel}>
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Tabs ---------- */

export type TabItem = { id: string; label: string; panel: ReactNode };

export function Tabs({ items, label, defaultTab }: { items: TabItem[]; label: string; defaultTab?: string }) {
  const base = useId();
  const [active, setActive] = useState(defaultTab ?? items[0]?.id ?? "");
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = Math.max(0, items.findIndex((t) => t.id === active));

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = nextIndex(index, e.key, items.length);
    if (next === null) return;
    e.preventDefault();
    const t = items[next];
    if (!t) return;
    setActive(t.id);
    refs.current[next]?.focus();
  }

  return (
    <div>
      <div role="tablist" aria-label={label} className={styles.tablist}>
        {items.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${base}-${t.id}-tab`}
            aria-selected={i === activeIndex}
            aria-controls={`${base}-${t.id}-panel`}
            tabIndex={i === activeIndex ? 0 : -1}
            className={styles.tab}
            onClick={() => setActive(t.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {items.map((t, i) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${base}-${t.id}-panel`}
          aria-labelledby={`${base}-${t.id}-tab`}
          hidden={i !== activeIndex}
          tabIndex={0}
          className={styles.tabPanel}
        >
          {t.panel}
        </div>
      ))}
    </div>
  );
}

/** Same look as Tabs, but each tab is a route (Help pages). */
export function TabLinks({ items, current, label }: { items: Array<{ href: string; label: string }>; current: string; label: string }) {
  return (
    <nav aria-label={label} className={styles.tablist}>
      {items.map((t) => (
        <Link key={t.href} href={t.href} className={styles.tab} aria-current={t.href === current ? "page" : undefined}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
