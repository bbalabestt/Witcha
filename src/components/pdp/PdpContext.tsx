"use client";

import { useSearchParams } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { selectVariant, variantParam } from "@/lib/data/product";
import type { Product, Variant } from "@/lib/data/types";

type PdpState = {
  product: Product;
  variant: Variant;
  quantity: number;
  setQuantity: (q: number) => void;
  selectVariant: (id: string) => void;
};

const PdpContext = createContext<PdpState | null>(null);

/**
 * Selected size and quantity for the product page. The size lives in `?variant=` so it can be
 * shared; switching sizes updates the URL in place (no server round trip, no layout shift).
 */
export function PdpProvider({ product, initialVariant, children }: { product: Product; initialVariant: string | null; children: ReactNode }) {
  const [variantId, setVariantId] = useState(() => selectVariant(product, initialVariant)?.id ?? product.variants[0]!.id);
  const [quantity, setQuantity] = useState(1);
  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0]!;

  const choose = useCallback(
    (id: string) => {
      setVariantId(id);
      setQuantity(1);
      const url = new URL(window.location.href);
      url.searchParams.set("variant", variantParam(id));
      window.history.replaceState(window.history.state, "", url);
    },
    [],
  );

  const value = useMemo(() => ({ product, variant, quantity, setQuantity, selectVariant: choose }), [product, variant, quantity, choose]);
  return <PdpContext.Provider value={value}>{children}</PdpContext.Provider>;
}

/** Reads `?variant=`; must sit inside <Suspense> (the fallback renders the default size). */
export function PdpProviderFromUrl({ product, children }: { product: Product; children: ReactNode }) {
  const params = useSearchParams();
  return (
    <PdpProvider product={product} initialVariant={params.get("variant")}>
      {children}
    </PdpProvider>
  );
}

export function usePdp(): PdpState {
  const ctx = useContext(PdpContext);
  if (!ctx) throw new Error("usePdp must be used inside <PdpProvider>");
  return ctx;
}
