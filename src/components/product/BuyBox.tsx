"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useCart, type LinePreview } from "@/components/commerce/CartProvider";
import { useShopUI } from "@/components/layout/ShopUI";
import { Icon } from "@/components/ui/Icon";
import { OptionPillGroup, QuantityStepper, clampQuantity } from "@/components/ui/Controls";
import { useToast } from "@/components/ui/Toast";
import { LIVE } from "@/lib/config/launch";
import { priceLabel } from "@/lib/data/money";
import { firstAvailable, maxQuantity, teaTypeLabel } from "@/lib/data/product";
import type { Product, Variant } from "@/lib/data/types";
import { isEmail } from "@/lib/http/validate";
import styles from "./BuyBox.module.css";

function preview(p: Product, v: Variant): LinePreview {
  return {
    merchandiseId: v.id,
    handle: p.handle,
    title: p.title,
    kind: p.kind,
    teaType: p.teaType,
    tin: p.tin,
    variantTitle: v.title,
    price: v.price,
    quantityAvailable: v.quantityAvailable,
  };
}

/** Name and detail line, price, tasting words, best for, choose it if, size, add to cart. */
export function BuyBox({ product, shopPay }: { product: Product; shopPay: boolean }) {
  const pathname = usePathname();
  const variant = firstAvailable(product)!;
  const [qty, setQty] = useState(1);
  const [atc, setAtc] = useState<"idle" | "loading" | "added">("idle");
  const max = maxQuantity(variant);
  const { add } = useCart();
  const mainRef = useRef<HTMLDivElement>(null);
  const [mainVisible, setMainVisible] = useState(true);
  const { setStickyBarVisible } = useShopUI();
  const price = priceLabel(variant.price);

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

  const atcLabel = atc === "loading" ? "Adding…" : atc === "added" ? "Added to cart" : "Add to cart";

  return (
    <div className={styles.box}>
      <div className={styles.titleBlock}>
        {product.teaType ? <span className="label">{teaTypeLabel(product.teaType)}</span> : null}
        <h1 className={styles.title}>{product.title}</h1>
        {product.detailLine ? <p className={styles.detail}>{product.detailLine}</p> : null}
      </div>

      {price ? (
        <div className={styles.priceRow}>
          <span className={styles.amount}>{price}</span>
          {variant.compareAtPrice ? (
            <s className={styles.compare}>
              <span className="visually-hidden">Was </span>
              {priceLabel(variant.compareAtPrice)}
            </s>
          ) : null}
        </div>
      ) : null}

      <div className={styles.guide}>
        <span className="label">Tasting words</span>
        {product.tastingNotes.length ? <p className={styles.notes}>{product.tastingNotes.join(" · ")}</p> : null}
        {product.bestFor ? (
          <p>
            <b>Best for</b> {product.bestFor}
          </p>
        ) : null}
        {product.chooseItIf ? (
          <p>
            <b>Choose it if</b> {product.chooseItIf}
          </p>
        ) : null}
      </div>

      {variant.title ? (
        <div className={styles.size}>
          <span className="label">Size</span>
          <OptionPillGroup label="Size" value={variant.id} onChange={() => undefined} options={product.variants.map((v) => ({ value: v.id, label: v.title, sub: priceLabel(v.price) ?? undefined, available: v.availableForSale }))} />
        </div>
      ) : null}

      <div className={styles.purchase}>
        {variant.availableForSale ? (
          <div className={styles.atcRow} ref={mainRef}>
            <QuantityStepper value={qty} max={max} onChange={(n) => setQty(clampQuantity(n, max))} />
            <button type="button" className={`${styles.atc} on-primary`} onClick={addToCart} aria-live="polite" aria-busy={atc === "loading" || undefined}>
              {atc === "loading" ? <span className={styles.spinner} aria-hidden="true" /> : null}
              {atc === "added" ? <Icon name="check" size={18} strokeWidth={2} /> : null}
              {atcLabel}
            </button>
          </div>
        ) : LIVE.backInStock ? (
          <NotifyMe variantId={variant.id} key={variant.id} />
        ) : (
          <button type="button" className={styles.atc} disabled>
            Sold out
          </button>
        )}
        {shopPay ? <div role="note" className={styles.shopPay} data-shop-pay="" /> : null}
      </div>

      {showSticky ? (
        <div className={styles.sticky}>
          <span className={styles.stickyText}>
            <span className={styles.stickyName}>{product.title}</span>
            <span className="body-small">{[variant.title, price].filter(Boolean).join(" · ")}</span>
          </span>
          <button type="button" className={`${styles.stickyButton} on-primary`} onClick={addToCart}>
            {atc === "loading" ? "Adding…" : atc === "added" ? "Added" : "Add to cart"}
          </button>
        </div>
      ) : null}
    </div>
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
    toast.show("We’ll email you when this tea is back.", "success");
  }

  if (state === "done") {
    return (
      <p className={styles.notified} role="status">
        <Icon name="check" size={20} />
        We’ll email you when this tea is back.
      </p>
    );
  }

  const invalid = state === "invalid" || state === "failed";
  return (
    <form className={styles.notify} onSubmit={submit} noValidate>
      <p className={styles.soldOut}>
        <b>Sold out.</b> Leave your email and we’ll tell you when it’s back.
      </p>
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
          {state === "invalid" ? "Enter an email address." : "That didn’t go through. Please try again."}
        </p>
      ) : null}
    </form>
  );
}
