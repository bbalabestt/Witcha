import { NextResponse } from "next/server";
import { env } from "@/lib/config/env";

/**
 * Account entry point. Accounts are Shopify-hosted (Customer Account API); we never build account pages.
 * Fixtures have no Shopify store, so sign-in falls back to the contact page.
 */
export function GET(request: Request) {
  const shopify = env().shopify;
  const target = shopify ? `https://${shopify.domain}/account` : new URL("/pages/contact", request.url).toString();
  return NextResponse.redirect(target, 307);
}
