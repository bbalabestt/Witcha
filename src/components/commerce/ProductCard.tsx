import Link from "next/link";
import { Badge, Chip } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MediaFrame } from "@/components/ui/MediaThumb";
import { BADGE_LABEL, defaultVariant, isMultiVariant, productEyebrow, tasteText } from "@/lib/data/product";
import type { Product } from "@/lib/data/types";
import { PriceBlock } from "./PriceBlock";
import { QuickAdd } from "./QuickAdd";
import { TasteScale } from "./TasteScale";
import styles from "./ProductCard.module.css";

type ProductCardProps = {
  product: Product;
  /** Only for a card that is the page's LCP element. */
  priority?: boolean;
  headingLevel?: "h2" | "h3";
  /** Rendered widths for next/image `sizes`. */
  sizes?: string;
};

/**
 * 4:5 media, badge, eyebrow, name, mini TasteScale + two notes (teas) or a short note (gifts/tools),
 * price, and one action: Add to cart (one size), Choose size (several) or Notify me (sold out).
 */
export function ProductCard({ product: p, priority, headingLevel: H = "h3", sizes = "(max-width: 600px) 100vw, 310px" }: ProductCardProps) {
  const href = `/products/${p.handle}`;
  const multi = isMultiVariant(p);
  const v = defaultVariant(p);
  const soldOut = !p.availableForSale;
  const badge = soldOut ? "SOLD OUT" : p.badges[0] ? BADGE_LABEL[p.badges[0]] : null;

  return (
    <article className={[styles.card, soldOut ? styles.soldOut : undefined].filter(Boolean).join(" ")}>
      <div className={styles.media}>
        <MediaFrame media={p.media[0] ?? null} ratio="4:5" sizes={sizes} priority={priority} fallbackLabel="Tin pack shot" />
        {badge ? (
          <Badge tone={badge === "SALE" ? "sale" : badge === "SOLD OUT" ? "pending" : "solid"} className={styles.badge}>
            {badge}
          </Badge>
        ) : null}
      </div>

      <div className={styles.body}>
        <span className="label">{productEyebrow(p)}</span>
        <H className={styles.name}>
          <Link href={href} className={styles.link}>
            {p.title}
          </Link>
        </H>
        {p.kind === "tea" && p.taste ? (
          <>
            <TasteScale size="mini" markers={[{ position: p.taste.position, label: tasteText(p.taste) }]} />
            {p.tastingNotes.length ? (
              <ul className={styles.notes} aria-label="Tasting notes">
                {p.tastingNotes.slice(0, 2).map((n, i) => (
                  <li key={`${n}-${i}`}>
                    <Chip>{n}</Chip>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : p.cardNote ? (
          <p className={styles.note}>{p.cardNote}</p>
        ) : null}
        {v ? <PriceBlock price={multi ? p.priceRange.min : v.price} compareAt={multi ? null : v.compareAtPrice} from={multi} /> : null}
        {multi && !soldOut ? <p className={styles.sizes}>{p.variants.map((x) => x.size).join(" · ")}</p> : null}
      </div>

      <div className={styles.actions}>
        {soldOut ? (
          <Button href={`${href}#notify`} variant="secondary" size="md" fullWidth>
            Notify me
          </Button>
        ) : multi || !v ? (
          <Button href={href} variant="secondary" size="md" fullWidth>
            Choose size
          </Button>
        ) : (
          <QuickAdd variantId={v.id} productTitle={p.title} />
        )}
      </div>
    </article>
  );
}

/** "Coming to the Academy": a non-link tile shown while there are only one or two teas. */
export function InPreparationCard() {
  return (
    <div className={styles.card}>
      <div className={styles.prep} aria-hidden="true">
        <span className={styles.prepArch} />
        <span className="label">Tea in preparation</span>
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>Coming to the Academy</h3>
        <p className={styles.note}>A new tea is being tasted. Letters from the Academy will hear first.</p>
      </div>
    </div>
  );
}
