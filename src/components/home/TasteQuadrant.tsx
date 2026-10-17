"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { LinePreview } from "@/components/commerce/CartProvider";
import { addLabel, useAddFeedback } from "@/components/commerce/useAddFeedback";
import { Icon } from "@/components/ui/Icon";
import type { QuadrantRow } from "@/lib/content/home";
import type { Image as Img } from "@/lib/data/types";
import { focusNewsletter } from "./focus-newsletter";
import styles from "./TasteQuadrant.module.css";

export type QuadCell = {
  id: string;
  row: QuadrantRow;
  role: string;
  keeper: string;
  tea: string;
  art: Img | null;
  /** Null for the concept keeper. */
  product: {
    handle: string;
    eyebrow: string;
    notes: string;
    price: string;
    tin: Img | null;
    preview: LinePreview | null;
  } | null;
  conceptTin: Img | null;
};

const MODE = {
  pure: { label: "Pure · whisked", prep: "2 g · 70 ml at 80°C · whisk 30 s", suit: "Selected · suits pure", other: "Best whisked pure" },
  latte: { label: "Latte · hot or iced", prep: "2 g · 30 ml water · 180 ml milk", suit: "Selected · suits a latte", other: "Best as a latte" },
} as const;

/** "Latte, or pure?": a LATTE | PURE switch and the four keepers as a quadrant (V4 default taste view). */
export function TasteQuadrant({ cells, roastedHandle }: { cells: QuadCell[]; roastedHandle: string | null }) {
  const [mode, setMode] = useState<QuadrantRow>("pure");
  const defaultFor = (row: QuadrantRow) => cells.find((c) => c.row === row && c.product)?.id ?? cells[0]?.id ?? "";
  const [selected, setSelected] = useState(() => defaultFor("pure"));
  const sel = cells.find((c) => c.id === selected) ?? cells[0];
  const { state, run } = useAddFeedback();

  const switchMode = (row: QuadrantRow) => {
    setMode(row);
    setSelected(defaultFor(row));
  };

  return (
    <section className={`container ${styles.section}`} data-cat-line="Latte or pure? Pick a keeper." aria-labelledby="wm-quadrant-title">
      <div className={styles.left}>
        <span className="label" data-reveal="left">
          Which Matcha Today? · Choose a keeper
        </span>
        <h2 id="wm-quadrant-title" className="display-section" data-reveal="left" data-delay="80">
          Latte, or <i className="serif-italic">pure?</i>
        </h2>
        <div className={styles.toggle} role="radiogroup" aria-label="How will you drink it?" data-reveal="left" data-delay="160">
          {(["latte", "pure"] as const).map((row) => (
            <button key={row} type="button" role="radio" aria-checked={mode === row} onClick={() => switchMode(row)}>
              {row}
            </button>
          ))}
        </div>
        <div className={styles.window} data-reveal="arch-open">
          <Image
            src="/art/articles-01-the-art-of-whisking.jpg"
            alt="Matcha whisked pure in a blue ceramic bowl."
            fill
            sizes="420px"
            className={styles.photo}
            data-on={mode === "pure" || undefined}
          />
          <Image
            src="/art/articles-02-an-iced-matcha-moment.jpg"
            alt="An iced matcha latte in a tall glass."
            fill
            sizes="420px"
            className={styles.photo}
            data-on={mode === "latte" || undefined}
          />
          <div className={styles.windowBar}>
            <span className="label">{MODE[mode].label}</span>
            <span className="body-small">{MODE[mode].prep}</span>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.quadWrap} data-reveal="right">
          <span className={`label ${styles.axisTop}`}>Pure</span>
          <span className={`label ${styles.axisBottom}`}>Latte</span>
          <div className={styles.axisX}>
            <span className="label">← Bright</span>
            <span className="label">Deep →</span>
          </div>
          <div className={styles.grid}>
            {cells.map((c) => {
              const on = c.id === selected;
              const inMode = c.row === mode;
              return (
                <button
                  key={c.id}
                  type="button"
                  className={styles.cell}
                  data-state={on ? "selected" : inMode ? "suits" : "other"}
                  data-row={c.row}
                  aria-pressed={on}
                  aria-label={`${c.keeper}, ${c.role.toLowerCase()}: ${c.tea}`}
                  onClick={() => {
                    setSelected(c.id);
                    setMode(c.row);
                  }}
                >
                  {on ? (
                    <span className={styles.selectedTag}>
                      <Icon name="check" size={14} strokeWidth={2} />
                      {MODE[c.row].suit}
                    </span>
                  ) : null}
                  <span className="label">{c.role}</span>
                  <span className={styles.art}>
                    {c.art ? <Image src={c.art.url} alt="" fill sizes="150px" className={styles.contain} /> : null}
                    {!inMode ? <span className={styles.naTag}>{MODE[c.row].other}</span> : null}
                  </span>
                  <span className={styles.keeper}>{c.keeper}</span>
                  <span className="body-small">{c.tea}</span>
                </button>
              );
            })}
          </div>
        </div>

        {sel ? (
          <div className={styles.detail} aria-live="polite">
            <span className={styles.detailTin}>
              {(sel.product?.tin ?? sel.conceptTin) ? (
                <Image src={(sel.product?.tin ?? sel.conceptTin)!.url} alt="" fill sizes="96px" className={styles.contain} />
              ) : null}
            </span>
            <div className={styles.detailText}>
              <span className="label">
                {sel.role} · {sel.product ? `Kept by ${sel.keeper}` : "Concept"}
              </span>
              <span className={styles.keeper}>{sel.product ? sel.tea : `${sel.keeper}’s tea`}</span>
              <span className="body-small">{sel.product ? sel.product.notes : "A bright tea for whisking pure is being tasted now."}</span>
              <div className={styles.detailRow}>
                <span className={styles.price}>{sel.product ? sel.product.price : "Coming soon"}</span>
                <div className={styles.detailActions}>
                  {sel.product ? (
                    <Link href={`/products/${sel.product.handle}`} className="label-link">
                      View tea
                    </Link>
                  ) : null}
                  {sel.product?.preview ? (
                    <button type="button" className={`${styles.add} on-primary`} onClick={() => sel.product?.preview && void run(sel.product.preview)}>
                      {addLabel(state, "Add to cart")}
                    </button>
                  ) : sel.product ? (
                    <Link href={`/products/${sel.product.handle}`} className={`${styles.add} on-primary`}>
                      Notify me
                    </Link>
                  ) : (
                    <button type="button" className={`${styles.add} on-primary`} onClick={focusNewsletter}>
                      Get the letter
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {roastedHandle ? (
          <p className="body-small">
            Prefer something roasted?{" "}
            <Link href={`/products/${roastedHandle}`} className="text-link">
              Organic Hojicha
            </Link>{" "}
            is kept in the tea room.
          </p>
        ) : null}
      </div>
    </section>
  );
}
