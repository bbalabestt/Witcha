import "server-only";
import { CommerceError } from "@/lib/data/repository";

export type ShopifyConfig = { domain: string; privateToken: string; apiVersion: string };

type GraphQLResponse<T> = { data?: T; errors?: Array<{ message: string }> };

/**
 * Server-only Storefront API client. Uses the private token header; the token never reaches the browser.
 * Retries once on network failure or 5xx.
 */
export function createStorefrontClient(config: ShopifyConfig) {
  const endpoint = `https://${config.domain}/api/${config.apiVersion}/graphql.json`;

  return async function storefront<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Shopify-Storefront-Private-Token": config.privateToken,
          },
          body: JSON.stringify({ query, variables }),
          cache: "no-store",
        });
        if (res.status >= 500) throw new CommerceError(`Shopify responded ${res.status}`, "network");
        if (!res.ok) throw new CommerceError(`Shopify responded ${res.status}`, "config");
        const json = (await res.json()) as GraphQLResponse<T>;
        if (json.errors?.length) throw new CommerceError(json.errors.map((e) => e.message).join("; "), "config");
        if (!json.data) throw new CommerceError("Shopify returned no data", "network");
        return json.data;
      } catch (err) {
        lastError = err;
        if (err instanceof CommerceError && err.kind !== "network") throw err;
      }
    }
    throw lastError instanceof CommerceError ? lastError : new CommerceError("Could not reach Shopify", "network");
  };
}

export type Storefront = ReturnType<typeof createStorefrontClient>;
