import type { ReactNode } from "react";
import { ChromeProvider } from "@/components/layout/ChromeContext";
import { FloatingNav } from "@/components/layout/FloatingNav";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileMenuServer } from "@/components/layout/MobileMenuServer";
import { NewsletterBand } from "@/components/layout/NewsletterBand";
import { SearchOverlay } from "@/components/layout/SearchOverlay";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <ChromeProvider>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <NewsletterBand />
      <Footer />
      <MobileMenuServer />
      <SearchOverlay />
      <FloatingNav />
    </ChromeProvider>
  );
}
