import "server-only";
import { env } from "@/lib/config/env";
import { createStorefrontClient } from "@/lib/shopify/client";
import { ShopifyRepository } from "@/lib/shopify/repository";
import { FixtureRepository } from "./fixture-repository";
import type { CommerceRepository } from "./repository";

let instance: CommerceRepository | null = null;

/** `COMMERCE_SOURCE=fixtures|shopify` picks the implementation. */
export function repository(): CommerceRepository {
  if (instance) return instance;
  const e = env();
  if (e.commerceSource === "shopify" && e.shopify) {
    instance = new ShopifyRepository(createStorefrontClient(e.shopify), {
      freeShippingThreshold: e.freeShippingThreshold,
      placeholderPrices: e.pricesArePlaceholders,
    });
  } else {
    instance = new FixtureRepository({ freeShippingThreshold: e.freeShippingThreshold });
  }
  return instance;
}
