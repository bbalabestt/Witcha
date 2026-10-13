import "server-only";

export type ShopifyClientConfig = {
  storeDomain: string;
  privateToken: string;
  apiVersion: string;
  /** Injected in tests; defaults to global fetch. */
  fetchImpl?: typeof fetch;
};

export class ShopifyError extends Error {
  constructor(
    message: string,
    readonly status: number | null = null,
    readonly details: unknown = null,
  ) {
    super(message);
    this.name = "ShopifyError";
  }
}

type GraphQLResponse<T> = { data?: T; errors?: Array<{ message: string; extensions?: { code?: string } }> };

export type ShopifyRequest = {
  query: string;
  variables?: Record<string, unknown>;
  /** Shopper IP, forwarded so Shopify's bot protection does not throttle the server. */
  buyerIp?: string | null;
};

const RETRYABLE = new Set([429, 502, 503, 504]);

/**
 * Typed Storefront API call over fetch. Server-only: the private token never reaches the client.
 * Caching is applied one level up with `use cache` + `cacheTag`, so requests here are never cached.
 */
export function createShopifyClient(config: ShopifyClientConfig) {
  const endpoint = `https://${config.storeDomain}/api/${config.apiVersion}/graphql.json`;
  const doFetch = config.fetchImpl ?? fetch;

  return async function shopifyFetch<T>({ query, variables, buyerIp }: ShopifyRequest, attempt = 0): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Shopify-Storefront-Private-Token": config.privateToken,
    };
    if (buyerIp) headers["Shopify-Storefront-Buyer-IP"] = buyerIp;

    let res: Response;
    try {
      res = await doFetch(endpoint, { method: "POST", headers, body: JSON.stringify({ query, variables }), cache: "no-store" });
    } catch (err) {
      if (attempt < 2) return shopifyFetch<T>({ query, variables, buyerIp }, attempt + 1);
      throw new ShopifyError(`Could not reach Shopify: ${(err as Error).message}`);
    }

    if (RETRYABLE.has(res.status) && attempt < 2) {
      await new Promise((r) => setTimeout(r, 250 * 2 ** attempt));
      return shopifyFetch<T>({ query, variables, buyerIp }, attempt + 1);
    }

    let body: GraphQLResponse<T>;
    try {
      body = (await res.json()) as GraphQLResponse<T>;
    } catch {
      throw new ShopifyError(`Shopify returned ${res.status} with a non-JSON body`, res.status);
    }

    if (!res.ok) throw new ShopifyError(`Shopify returned ${res.status}`, res.status, body.errors ?? null);
    if (body.errors?.length) throw new ShopifyError(body.errors.map((e) => e.message).join("; "), res.status, body.errors);
    if (!body.data) throw new ShopifyError("Shopify returned no data", res.status);
    return body.data;
  };
}

export type ShopifyFetch = ReturnType<typeof createShopifyClient>;
