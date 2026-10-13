"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { addToCartForm, type CartActionResult } from "@/lib/cart/actions";
import styles from "./ProductCard.module.css";

const ADDED_MS = 2000;

/** Card "Add to cart" for single-size products: Adding… → Added (2 s) → idle; errors stay inline. */
export function QuickAdd({ variantId, productTitle }: { variantId: string; productTitle: string }) {
  const [result, action, pending] = useActionState<CartActionResult | null, FormData>(addToCartForm, null);
  const [showAdded, setShowAdded] = useState(false);
  const [seen, setSeen] = useState<CartActionResult | null>(null);

  if (result !== seen) {
    setSeen(result);
    if (result?.ok) setShowAdded(true);
  }

  useEffect(() => {
    if (!showAdded) return;
    const t = window.setTimeout(() => setShowAdded(false), ADDED_MS);
    return () => window.clearTimeout(t);
  }, [showAdded]);

  const status = pending ? "loading" : showAdded ? "success" : "idle";
  return (
    <form action={action} className={styles.cta}>
      <input type="hidden" name="variantId" value={variantId} />
      <input type="hidden" name="quantity" value="1" />
      <Button type="submit" variant="secondary" size="md" fullWidth status={status} disabled={pending} aria-label={`Add ${productTitle} to cart`}>
        {pending ? "Adding…" : showAdded ? "Added" : "Add to cart"}
      </Button>
      <p className={styles.ctaStatus} role="status">
        {result && !result.ok ? result.error : showAdded ? `${productTitle} added to your cart.` : ""}
      </p>
    </form>
  );
}
