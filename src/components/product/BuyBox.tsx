"use client";

import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useCart, type LinePreview } from "@/components/commerce/CartProvider";
import { TasteScaleFull } from "@/components/commerce/TasteScale";
import { useShopUI } from "@/components/layout/ShopUI";
import { emitFamiliar } from "@/components/motion/familiar-events";
import { Icon, type IconName } from "@/components/ui/Icon";
import { OptionPillGroup, QuantityStepper, clampQuantity } from "@/components/ui/Controls";
import { useToast } from "@/components/ui/Toast";
import { formatMoney, multiplyMoney } from "@/lib/data/money";
import { eyebrow, maxQuantity, perCup, stockState, tasteLabel, variantDelta } from "@/lib/data/product";
import type { BestFor, Product, Variant } from "@/lib/data/types";
import { isEmail } from "@/lib/http/validate";
import styles from "./BuyBox.module.css";

const BEST_FOR_ICON: Record<BestFor, IconName> = { Latte: "cup", Iced: "iced", Straight: "whisk" };

type Props = {
  product: Product;
  initialVariantId?: string | null;
  lowStockThreshold: number;
  /** Other teas' taste positions, drawn as outline arches. */
  otherPositions: number[];
  shippingPromise: ReactNode;
  shopPay: boolean;
};

function preview(p: Product, v: Variant): LinePreview {
  return {
    merchandiseId: v.id,
    handle: p.handle,
    title: p.title,
    kind: p.kind,
    eyebrow: eyebrow(p),
    tin: p.tin,
    variantTitle: v.title,
    price: v.price,
    quantityAvailable: v.quantityAvailable,
  };
}

/** Reads `?variant=` (needs a Suspense boundary; the page renders `BuyBox` with the default as fallback). */
export function BuyBoxFromUrl(props: Omit<Props, "initialVariantId">) {
  const id = useSearchParams().get("variant");
  return <BuyBox key={id ?? "default"} {...props} initialVariantId={id} />;
}

/**
 * Buy box in V4 order: eyebrow + badge, name, keeper line, price block, taste + notes + best for, size,
 * stock notice directly above the button, quantity + add to cart, express pay slot, shipping promise.
 * Stock notice and button always agree; sold out swaps the button for a Notify me form of the same height.
 */
export function BuyBox({ product, initialVariantId, lowStockThreshold, otherPositions, shippingPromise, shopPay }: Props) {
  const pathname = usePathname();
  const first = product.variants.find((v) => v.id === initialVariantId) ?? product.variants.find((v) => v.availableForSale) ?? product.variants[0]!;
  const [variantId, setVariantId] = useState(first.id);
  const [qty, setQty] = useState(1);
  const [atc, setAtc] = useState<"idle" | "loading" | "added">("idle");
  const variant = product.variants.find((v) => v.id === variantId) ?? first;
  const stock = stockState(variant, lowStockThreshold);
  const max = maxQuantity(variant);
  const cup = perCup(variant);
  const { add } = useCart();
  const mainRef = useRef<HTMLDivElement>(null);
  const [mainVisible, setMainVisible] = useState(true);
  const { setStickyBarVisible } = useShopUI();
  const multi = product.variants.length > 1;

  const select = (id: string) => {
    setVariantId(id);
    setQty(1);
    setAtc("idle");
    // Keep the URL shareable without a navigation (no layout shift, no scroll).
    const url = new URL(window.location.href);
    url.searchParams.set("variant", id);
    window.history.replaceState(window.history.state, "", url);
  };

  async function addToCart() {
    if (!variant.availableForSale || atc !== "idle") return;
    setAtc("loading");
    const ok = await add(preview(product, variant), qty);
    if (!ok) {
      setAtc("idle");
      return;
    }
    setAtc("added");
    window.setTimeout(() => setAtc("idle"), 2000);
  }

  // The sticky buy bar appears once the main button has scrolled out of view (any width).
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([en]) => {
      if (!en) return;
      setMainVisible(en.isIntersecting || en.boundingClientRect.top > 0);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [variant.availableForSale]);

  const showSticky = !mainVisible && variant.availableForSale;
  useEffect(() => {
    setStickyBarVisible(showSticky);
    return () => setStickyBarVisible(false);
  }, [showSticky, setStickyBarVisible, pathname]);

  const atcLabel = atc === "loading" ? "Adding…" : atc === "added" ? "Added" : `Add to cart · ${formatMoney(multiplyMoney(variant.price, qty))}`;

  return (
    <div className={styles.box}>
      <div className={styles.eyebrowRow} data-reveal="up">
        <span className="label">{eyebrow(product)}</span>
        {product.badge ? (
          <span className={styles.badge} data-kind={product.badge}>
            {product.badge}
          </span>
        ) : null}
        {product.pending ? <span className="pending-tag">Pending founder decision</span> : null}
      </div>
      <div className={styles.titleBlock} data-reveal="up">
        <h1 className={styles.title}>{product.title}</h1>
        {product.character ? <span className="body-small">Kept at the Academy by {product.character.name}</span> : null}
      </div>

      <div className={styles.price} data-reveal="up">
        <span className={styles.priceRow}>
          <span className={styles.amount}>{formatMoney(variant.price)}</span>
          {variant.compareAtPrice ? (
            <>
              <s className={styles.compare}>
                <span className="visually-hidden">Was </span>
                {formatMoney(variant.compareAtPrice)}
              </s>
              <span className={styles.sale}>Sale</span>
            </>
          ) : null}
        </span>
        <span className="body-small">{cup ? `≈ ${formatMoney(cup)} per cup ([2] g serve) · incl. GST` : "incl. GST"}</span>
      </div>

      {product.taste ? (
        <div className={styles.taste} data-reveal="up">
          <TasteScaleFull position={product.taste.position} text={tasteLabel(product.taste)} others={otherPositions} />
          {product.tastingNotes.length ? (
            <ul className={styles.notes} aria-label="Tasting notes">
              {product.tastingNotes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          ) : null}
          {product.bestFor.length ? (
            <div className={styles.bestFor}>
              <span className="label">Best for</span>
              {product.bestFor.map((b) => (
                <span key={b} className={styles.bestItem}>
                  <Icon name={BEST_FOR_ICON[b]} size={20} />
                  {b}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {multi || variant.title ? (
        <div className={styles.size} data-reveal="up">
          <span className="label">Size</span>
          <OptionPillGroup
            label="Size"
            value={variant.id}
            onChange={select}
            options={product.variants.map((v) => ({
              value: v.id,
              label: v.title,
              sub: variantDelta(product.variants[0]!, v),
              available: v.availableForSale,
            }))}
          />
        </div>
      ) : null}

      <div className={styles.purchase} data-reveal="up">
        <StockNotice stock={stock} size={variant.title} />
        {variant.availableForSale ? (
          <>
            <div className={styles.atcRow} ref={mainRef}>
              <QuantityStepper value={qty} max={max} onChange={(n) => setQty(clampQuantity(n, max))} />
              <button type="button" className={`${styles.atc} on-primary`} onClick={addToCart} aria-live="polite" aria-busy={atc === "loading" || undefined}>
                {atc === "loading" ? <span className={styles.spinner} aria-hidden="true" /> : null}
                {atc === "added" ? <Icon name="check" size={18} strokeWidth={2} /> : null}
                {atcLabel}
              </button>
            </div>
            <div className={styles.or}>
              <span />
              or
              <span />
            </div>
            <div role="note" className={styles.shopPay} data-shop-pay={shopPay || undefined}>
              {shopPay ? null : "Shop Pay slot · rendered by Shopify"}
            </div>
          </>
        ) : (
          <NotifyMe variantId={variant.id} key={variant.id} />
        )}
      </div>

      {shippingPromise}

      {showSticky ? (
        <div className={styles.sticky}>
          <span className={styles.stickyThumb}>
            {product.tin ? <Image src={product.tin.url} alt="" fill sizes="40px" className={styles.contain} /> : null}
          </span>
          <span className={styles.stickyText}>
            <span className={styles.stickyName}>{product.title}</span>
            <span className="body-small">
              {variant.title ? `${variant.title} · ` : ""}
              {formatMoney(variant.price)}
            </span>
          </span>
          <button type="button" className={`${styles.stickyButton} on-primary`} onClick={addToCart}>
            {atc === "loading" ? "Adding…" : atc === "added" ? "Added ✓" : "Add to cart"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function StockNotice({ stock, size }: { stock: ReturnType<typeof stockState>; size: string }) {
  const sizeText = size ? ` in ${size}` : "";
  if (stock.kind === "low") {
    return (
      <p className={styles.stock}>
        <Icon name="info" size={20} />
        <b>
          Only {stock.quantity} left{sizeText}.
        </b>
      </p>
    );
  }
  if (stock.kind === "sold-out") {
    return (
      <p className={styles.stock}>
        <Icon name="info" size={20} />
        <span>
          <b>Sold out{sizeText}.</b> Leave your email and we’ll tell you when it’s back.
        </span>
      </p>
    );
  }
  return (
    <p className={styles.stock}>
      <Icon name="check" size={20} />
      <span>
        <b>In stock.</b> Ready to dispatch.
      </span>
    </p>
  );
}

function NotifyMe({ variantId }: { variantId: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "invalid" | "failed">("idle");
  const errorId = useId();
  const toast = useToast();

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!isEmail(email)) {
      setState("invalid");
      return;
    }
    setState("loading");
    const res = await fetch("/api/notify-me", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, variantId }),
    }).catch(() => null);
    if (!res?.ok) {
      setState("failed");
      return;
    }
    setState("done");
    emitFamiliar({ type: "say", text: "I’ll keep watch.", ms: 2400 });
    toast.show("We’ll email you when this size is back.", "success");
  }

  if (state === "done") {
    return (
      <p className={styles.notified} role="status">
        <Icon name="check" size={20} />
        We’ll email you when this size is back.
      </p>
    );
  }

  const invalid = state === "invalid" || state === "failed";
  return (
    <form className={styles.notify} onSubmit={submit} noValidate>
      <div className={styles.notifyRow}>
        <input
          type="email"
          autoComplete="email"
          placeholder="Email"
          aria-label="Email for restock alert"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : undefined}
          className={styles.notifyInput}
        />
        <button type="submit" className={`${styles.notifyButton} on-primary`} aria-busy={state === "loading" || undefined}>
          Notify me
        </button>
      </div>
      {invalid ? (
        <p id={errorId} className={styles.error}>
          <Icon name="alert" size={18} />
          {state === "invalid" ? "Check the email address, e.g. name@example.com." : "That didn’t go through. Please try again."}
        </p>
      ) : null}
    </form>
  );
}
