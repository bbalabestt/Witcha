"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/Button";
import type { CartLineMerchandise } from "@/lib/data/types";
import styles from "./ProductCard.module.css";

const ADDED_MS = 2000;

/** Card "Add to cart" for single-size products: opens the drawer with the line, then Adding… → Added. */
export function QuickAdd({ merchandise }: { merchandise: CartLineMerchandise }) {
  const { addItem } = useCart();
  const [state, setState] = useState<"idle" | "loading" | "added">("idle");

  useEffect(() => {
    if (state !== "added") return;
    const t = window.setTimeout(() => setState("idle"), ADDED_MS);
    return () => window.clearTimeout(t);
  }, [state]);

  return (
    <div className={styles.cta}>
      <Button
        variant="secondary"
        size="md"
        fullWidth
        status={state === "loading" ? "loading" : state === "added" ? "success" : "idle"}
        disabled={state === "loading"}
        aria-label={`Add ${merchandise.productTitle} to cart`}
        onClick={async () => {
          setState("loading");
          const r = await addItem(merchandise, 1);
          setState(r.ok ? "added" : "idle");
        }}
      >
        {state === "loading" ? "Adding…" : state === "added" ? "Added" : "Add to cart"}
      </Button>
    </div>
  );
}
