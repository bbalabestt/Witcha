import type { Metadata } from "next";
import { NotFoundContent } from "@/components/content/NotFoundContent";
import ShopLayout from "./(shop)/layout";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

/** Unmatched URLs keep the full header and footer (V2.1 1.10). */
export default function NotFound() {
  return (
    <ShopLayout params={Promise.resolve({})}>
      <NotFoundContent />
    </ShopLayout>
  );
}
