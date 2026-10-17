import "server-only";
import { env } from "@/lib/config/env";
import { SAMPLE_SOCIAL_REVIEWS } from "./sample-reviews";

/**
 * Provider interfaces for decisions the founders have not made yet. Each ships a dev stub that logs and
 * succeeds, and throws `NotConfigured` in production until a real provider is wired in.
 */

export class NotConfiguredError extends Error {
  constructor(provider: string) {
    super(`${provider} provider is not configured.`);
    this.name = "NotConfiguredError";
  }
}

export type NewsletterProvider = { subscribe(email: string): Promise<void> };
export type BackInStockProvider = { notify(email: string, variantId: string): Promise<void> };
export type ContactMessage = { name: string; email: string; orderNumber: string; topic: string; message: string };
export type ContactProvider = { send(message: ContactMessage): Promise<void> };

export type SocialSource = "google" | "facebook";
export type SocialReview = {
  id: string;
  source: SocialSource;
  author: string;
  /** Relative date as the platform shows it. */
  date: string;
  /** Google star rating 1–5; null for Facebook recommendations. */
  rating: number | null;
  text: string;
  tea: string;
  photo: { url: string; alt: string } | null;
};
export type SocialReviews = {
  google: { rating: number; count: number } | null;
  facebook: { recommendPercent: number; count: number } | null;
  reviews: SocialReview[];
  /** True for the invented demo set: every surface then shows a SAMPLE DATA tag. */
  sample: boolean;
};

/** Google Business Profile + Facebook page reviews (V4 home section and footer strip). */
export type SocialReviewsProvider = { get(): Promise<SocialReviews> };

function stub<T extends object>(name: string, impl: T): T {
  if (!env().isProduction) return impl;
  return new Proxy(impl, {
    get() {
      return () => Promise.reject(new NotConfiguredError(name));
    },
  });
}

export const newsletter: NewsletterProvider = stub("Newsletter", {
  async subscribe(email: string) {
    console.info(`[newsletter:stub] subscribe ${email}`);
  },
});

export const backInStock: BackInStockProvider = stub("Back in stock", {
  async notify(email: string, variantId: string) {
    console.info(`[back-in-stock:stub] ${email} → ${variantId}`);
  },
});

export const contact: ContactProvider = stub("Contact", {
  async send(message: ContactMessage) {
    console.info(`[contact:stub] ${message.topic} from ${message.email}`);
  },
});

const EMPTY: SocialReviews = { google: null, facebook: null, reviews: [], sample: false };

/** Empty until a reviews app is chosen, so the zero state is the default. `REVIEWS_SOURCE=sample` is demo-only. */
export const socialReviews: SocialReviewsProvider = {
  async get() {
    return env().reviewsSource === "sample" ? SAMPLE_SOCIAL_REVIEWS : EMPTY;
  },
};
