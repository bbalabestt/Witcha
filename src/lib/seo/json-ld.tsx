import { SITE } from "@/lib/config/site";
import type { Product } from "@/lib/data/types";

/** Absolute URL for structured data; NEXT_PUBLIC_SITE_URL is inlined at build time. */
export function absoluteUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

const money = (amount: number) => (amount / 100).toFixed(2);

/**
 * Product JSON-LD. Placeholder prices (fixtures) are left out so search engines never index a
 * stand-in figure. No aggregateRating until real reviews exist.
 */
export function productJsonLd(p: Product): Record<string, unknown> {
  const images = p.media.filter((m) => m.kind === "image").map((m) => (m.kind === "image" ? m.url : ""));
  const offers = p.variants
    .filter((v) => !v.price.placeholder)
    .map((v) => ({
      "@type": "Offer",
      sku: v.sku ?? undefined,
      name: `${p.title} ${v.size}`,
      price: money(v.price.amount),
      priceCurrency: v.price.currencyCode,
      availability: v.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/products/${p.handle}?variant=${v.id.split("/").pop()}`),
      itemCondition: "https://schema.org/NewCondition",
    }));
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    description: p.description,
    image: images.length ? images : undefined,
    brand: { "@type": "Brand", name: SITE.name },
    url: absoluteUrl(`/products/${p.handle}`),
    offers: offers.length ? offers : undefined,
  };
}

export function breadcrumbJsonLd(items: Array<{ label: string; href?: string }>): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: c.href ? absoluteUrl(c.href) : undefined,
    })),
  };
}

/** Escapes `<` so merchant text can never close the script tag. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
