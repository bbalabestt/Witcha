import { firstAvailable } from "./data/product";
import type { Product } from "./data/types";

/** Escapes `<` so a product field can never close the script tag. */
function json(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function absolute(url: string, siteUrl: string): string {
  return url.startsWith("http") ? url : `${siteUrl}${url}`;
}

/** `Product` JSON-LD. Placeholder prices are left out so search engines never index them. */
export function productJsonLd(p: Product, siteUrl: string): string {
  const v = firstAvailable(p);
  const offers =
    v && !v.price.placeholder
      ? p.variants.map((x) => ({
          "@type": "Offer",
          sku: x.id,
          price: x.price.amount.toFixed(2),
          priceCurrency: x.price.currencyCode,
          availability: x.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          url: `${siteUrl}/products/${p.handle}?variant=${encodeURIComponent(x.id)}`,
        }))
      : undefined;
  return json({
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    description: p.description,
    brand: { "@type": "Brand", name: "WITCHA MATCHA" },
    image: p.tin ? [absolute(p.tin.url, siteUrl)] : undefined,
    offers,
  });
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>, siteUrl: string): string {
  return json({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${siteUrl}${it.path}` })),
  });
}
