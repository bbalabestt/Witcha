import "server-only";
import { env } from "@/lib/config/env";

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
