"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { PriceBlock } from "@/components/commerce/PriceBlock";
import { StockNotice } from "@/components/commerce/StockNotice";
import { TasteScale, type TasteMarker } from "@/components/commerce/TasteScale";
import { Badge, Chip } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { OptionPillGroup, QuantityStepper } from "@/components/ui/Controls";
import { Icon, type IconName } from "@/components/ui/Icon";
import { merchandiseFor } from "@/lib/cart/optimistic";
import { formatMoney, multiplyMoney, perCup, subtractMoney } from "@/lib/data/money";
import { BADGE_LABEL, productEyebrow, stockState, tasteText } from "@/lib/data/product";
import type { BestFor } from "@/lib/data/types";
import { NotifyMe } from "./NotifyMe";
import { usePdp } from "./PdpContext";
import styles from "./Pdp.module.css";

const BEST_FOR_ICON: Record<BestFor, IconName> = { Latte: "cup", Iced: "iced", Straight: "whisk" };
const ADDED_MS = 2000;

type BuyBoxProps = {
  lowStockThreshold: number;
  /** Other teas, shown as outline markers on the scale for comparison. */
  compareMarkers: TasteMarker[];
  shippingPromise: ReactNode;
  shopPay: boolean;
};

export function useAddToCart() {
  const { product, variant, quantity } = usePdp();
  const { addItem } = useCart();
  const [state, setState] = useState<"idle" | "loading" | "added">("idle");
  useEffect(() => {
    if (state !== "added") return;
    const t = window.setTimeout(() => setState("idle"), ADDED_MS);
    return () => window.clearTimeout(t);
  }, [state]);
  async function add() {
    if (!variant.availableForSale || state === "loading") return;
    setState("loading");
    const r = await addItem(merchandiseFor(product, variant), quantity);
    setState(r.ok ? "added" : "idle");
  }
  return { state, add };
}

export function BuyBox({ lowStockThreshold, compareMarkers, shippingPromise, shopPay }: BuyBoxProps) {
  const { product: p, variant: v, quantity, setQuantity, selectVariant } = usePdp();
  const { state, add } = useAddToCart();
  const stock = stockState(v, lowStockThreshold);
  const first = p.variants[0]!;
  const badge = p.badges[0] ? BADGE_LABEL[p.badges[0]] : null;
  const cup = perCup(v.price, v.servings);
  const max = v.quantityAvailable !== null && v.quantityAvailable > 0 ? Math.min(99, v.quantityAvailable) : 99;

  const options = p.variants.map((x, i) => {
    const delta = subtractMoney(x.price, first.price);
    return {
      value: x.id,
      label: x.size,
      sub: i === 0 || delta.amount <= 0 ? formatMoney(x.price) : `+${formatMoney(delta)}`,
      available: x.availableForSale,
    };
  });

  return (
    <div className={styles.buyBox}>
      <div className={styles.eyebrowRow}>
        <span className="label">{productEyebrow(p)}</span>
        {badge ? <Badge tone={badge === "SALE" ? "sale" : "solid"}>{badge}</Badge> : null}
      </div>

      <div className={styles.titleBlock}>
        <h1 className={styles.title}>{p.title}</h1>
        {p.character ? <p className={styles.small}>Kept at the Academy by {p.character.name}</p> : null}
      </div>

      <PriceBlock
        price={v.price}
        compareAt={v.compareAtPrice}
        perCup={cup}
        perCupNote="([2] g serve) · incl. GST"
        size="pdp"
        className={styles.price}
      />
      {!cup ? <p className={styles.small}>incl. GST</p> : null}

      {p.taste ? (
        <div className={styles.tastePanel}>
          <div className={styles.tasteHead}>
            <span className="label">Taste</span>
            <span className={styles.tasteText}>{tasteText(p.taste)}</span>
          </div>
          <TasteScale
            size="panel"
            markers={[...compareMarkers.map((m) => ({ ...m, tone: "outline" as const, href: undefined })), { position: p.taste.position, label: `${p.title}, ${tasteText(p.taste)}` }]}
          />
          {p.tastingNotes.length ? (
            <ul className={styles.notes} aria-label="Tasting notes">
              {p.tastingNotes.map((n, i) => (
                <li key={`${n}-${i}`}>
                  <Chip tone="noteOnSoft">{n}</Chip>
                </li>
              ))}
            </ul>
          ) : null}
          {p.bestFor.length ? (
            <div className={styles.bestFor}>
              <span className="label">Best for</span>
              <ul>
                {p.bestFor.map((b) => (
                  <li key={b}>
                    <Icon name={BEST_FOR_ICON[b]} size={20} />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {p.variants.length > 1 ? (
        <div className={styles.sizeBlock}>
          <span className="label" id="size-label">
            Size
          </span>
          <OptionPillGroup label="Size" options={options} value={v.id} onChange={selectVariant} />
        </div>
      ) : null}

      <div className={styles.actionBlock}>
        <StockNotice state={stock} size={v.size} />
        {stock.kind === "sold-out" ? (
          <NotifyMe key={v.id} variantId={v.id} productHandle={p.handle} />
        ) : (
          <>
            <div className={styles.atcRow} data-atc-main="">
              <QuantityStepper value={quantity} max={max} onChange={setQuantity} />
              <Button
                size="xl"
                className={styles.atc}
                onClick={add}
                status={state === "loading" ? "loading" : state === "added" ? "success" : "idle"}
                disabled={state === "loading"}
              >
                {state === "loading" ? "Adding…" : state === "added" ? "Added" : `Add to cart · ${formatMoney(multiplyMoney(v.price, quantity))}`}
              </Button>
            </div>
            {shopPay ? (
              <>
                <div className={styles.or}>or</div>
                <div className={styles.walletSlot}>Shop Pay · rendered by Shopify</div>
              </>
            ) : null}
          </>
        )}
      </div>

      {shippingPromise}
    </div>
  );
}
