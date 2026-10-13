import { getServerEnv } from "@/lib/config/env";

/** Accounts are Shopify-hosted (Customer Account API); this only forwards to the store's sign-in. */
export async function GET() {
  const env = getServerEnv();
  if (env.COMMERCE_SOURCE === "shopify" && env.SHOPIFY_STORE_DOMAIN) {
    return Response.redirect(`https://${env.SHOPIFY_STORE_DOMAIN}/account`, 302);
  }
  return new Response("Accounts open once the Shopify store is connected.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
