import { Icon } from "@/components/ui/Icon";
import { Breadcrumb } from "@/components/ui/Navigation";
import { tasteText } from "@/lib/data/product";
import type { Collection, Product } from "@/lib/data/types";
import { TasteScale } from "./TasteScale";
import styles from "./Collection.module.css";

/** "Yame no Mukashi" → "Yame"; "[Daily tea name]" → "[Daily]" (prototype captions). */
export function shortName(title: string): string {
  const bracketed = title.startsWith("[");
  const first = title.replace(/^\[/, "").split(/\s+/)[0] ?? title;
  const word = first.replace(/\]$/, "");
  return bracketed ? `[${word}]` : word;
}

type Variant = "taste" | "gifts" | "plain";

export function collectionVariant(handle: string): Variant {
  if (handle === "matcha") return "taste";
  if (handle === "gifts") return "gifts";
  return "plain";
}

const COPY: Record<Variant, { crumb: string; title?: string; intro?: string }> = {
  taste: {
    crumb: "Shop Matcha",
    title: "Which Matcha Today?",
    intro: "Choose by taste. Bright teas are fresh and lively; deep teas are rounder and richer, and hold up beautifully in milk.",
  },
  gifts: {
    crumb: "Gifts",
    title: "Gifts with a little magic",
    intro: "Tick “This is a gift” in your cart and write a note of up to 150 characters. Prices stay off the packing slip.",
  },
  plain: { crumb: "" },
};

type CollectionHeaderProps = {
  collection: Collection;
  /** Teas placed on the scale (taste variant). */
  teas?: Product[];
  giftCutoff?: string;
};

export function CollectionHeader({ collection, teas = [], giftCutoff }: CollectionHeaderProps) {
  const variant = collectionVariant(collection.handle);
  const copy = COPY[variant];
  const title = copy.title ?? collection.title;
  const intro = copy.intro ?? collection.description;
  const placed = teas.filter((t) => t.taste);

  return (
    <>
      <section className={[styles.header, styles[`header_${variant}`]].join(" ")}>
        <div className={styles.headerInner}>
          <div className={styles.headerCopy}>
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: copy.crumb || collection.title }]} />
            <h1 className="heading-1">{title}</h1>
            {intro ? <p className={styles.intro}>{intro}</p> : null}
          </div>
          {variant === "taste" && placed.length ? (
            <div id="taste" className={styles.headerScale}>
              <TasteScale
                size="header"
                markers={placed.map((t) => ({
                  position: t.taste!.position,
                  label: `${t.title}, ${tasteText(t.taste!)}`,
                  caption: `${shortName(t.title)} · ${t.taste!.position} of 5`,
                  href: `/products/${t.handle}`,
                }))}
              />
            </div>
          ) : null}
        </div>
      </section>
      {variant === "gifts" && giftCutoff ? (
        <p className={styles.cutoff}>
          <Icon name="gift" size={20} />
          {giftCutoff}
        </p>
      ) : null}
    </>
  );
}
