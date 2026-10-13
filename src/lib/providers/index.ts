import "server-only";
import { getServerEnv } from "@/lib/config/env";

/**
 * Swappable providers for decisions that are still pending. Each has a console-logging stub that
 * succeeds in development and a clear NotConfigured error in production when nothing is set.
 */

export class NotConfiguredError extends Error {
  constructor(readonly provider: string) {
    super(`${provider} provider is not configured`);
    this.name = "NotConfiguredError";
  }
}

export type ProviderResult = { ok: true } | { ok: false; reason: "invalid" | "unavailable"; message: string };

export interface NewsletterProvider {
  subscribe(input: { email: string; source: string }): Promise<ProviderResult>;
}

export interface BackInStockProvider {
  register(input: { email: string; variantId: string; productHandle: string }): Promise<ProviderResult>;
}

export interface ContactProvider {
  send(input: { name: string; email: string; topic: string; message: string; orderNumber?: string }): Promise<ProviderResult>;
}

export type ReviewSummary = { count: number; average: number | null };
export type Review = { id: string; author: string; rating: number; title: string; body: string; createdAt: string; verified: boolean };

export interface ReviewsProvider {
  getSummary(productHandle: string): Promise<ReviewSummary>;
  getReviews(productHandle: string): Promise<Review[]>;
}

function stub<T extends object>(name: string, impl: T): T {
  const env = getServerEnv();
  if (env.NODE_ENV === "production") {
    // Wrap every method so the failure surfaces per request, not at import time.
    return new Proxy(impl, {
      get(target, prop, receiver) {
        const v = Reflect.get(target, prop, receiver);
        if (typeof v !== "function") return v;
        return () => Promise.reject(new NotConfiguredError(name));
      },
    });
  }
  return impl;
}

function redact(email: string): string {
  const [user = "", domain = ""] = email.split("@");
  return `${user.slice(0, 2)}***@${domain}`;
}

export function getNewsletterProvider(): NewsletterProvider {
  const p = getServerEnv().NEWSLETTER_PROVIDER;
  if (p === "klaviyo" || p === "shopify") throw new NotConfiguredError(`Newsletter (${p}: adapter pending)`);
  return stub<NewsletterProvider>("Newsletter", {
    async subscribe({ email, source }) {
      console.info(`[newsletter:stub] subscribe ${redact(email)} from ${source}`);
      return { ok: true };
    },
  });
}

export function getBackInStockProvider(): BackInStockProvider {
  const p = getServerEnv().BACK_IN_STOCK_PROVIDER;
  if (p === "klaviyo") throw new NotConfiguredError("Back in stock (klaviyo: adapter pending)");
  return stub<BackInStockProvider>("Back in stock", {
    async register({ email, variantId }) {
      console.info(`[notify-me:stub] ${redact(email)} for ${variantId}`);
      return { ok: true };
    },
  });
}

export function getContactProvider(): ContactProvider {
  const p = getServerEnv().CONTACT_PROVIDER;
  if (p === "resend") throw new NotConfiguredError("Contact (resend: adapter pending)");
  return stub<ContactProvider>("Contact", {
    async send({ email, topic }) {
      console.info(`[contact:stub] message from ${redact(email)} about ${topic}`);
      return { ok: true };
    },
  });
}

/** Returns nothing until a reviews app is chosen; the UI renders the zero-state. Never fabricated. */
export function getReviewsProvider(): ReviewsProvider {
  return {
    async getSummary() {
      return { count: 0, average: null };
    },
    async getReviews() {
      return [];
    },
  };
}
