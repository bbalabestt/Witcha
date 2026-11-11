import { CartDrawer } from "@/components/commerce/CartDrawer";
import { toUpsellItems } from "@/components/commerce/card-data";
import { CartProvider } from "@/components/commerce/CartProvider";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { ConsentBanner } from "@/components/layout/ConsentBanner";
import { FloatingNav } from "@/components/layout/FloatingNav";
import { Footer } from "@/components/layout/Footer";
import { Header, type MegaTea } from "@/components/layout/Header";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { NewsletterBand } from "@/components/layout/NewsletterBand";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { ShopUIProvider } from "@/components/layout/ShopUI";
import { MotionRuntime } from "@/components/motion/MotionRuntime";
import { RouteCurtain } from "@/components/motion/RouteCurtain";
import { ToastProvider } from "@/components/ui/Toast";
import { readCart } from "@/lib/cart/server";
import { env } from "@/lib/config/env";
import { LIVE } from "@/lib/config/launch";
import { getProducts, getSiteSettings } from "@/lib/data/catalog";

export default async function ShopLayout({ children }: LayoutProps<"/">) {
  const e = env();
  const [settings, products] = await Promise.all([getSiteSettings(), getProducts()]);
  // Read at request time and streamed into the client cart; never awaited here so the shell stays static.
  const cartPromise = readCart();
  const megaTeas: MegaTea[] = products.filter((p) => p.kind === "tea").map((p) => ({ handle: p.handle, title: p.title }));
  const upsell = LIVE.accessories ? toUpsellItems(products) : [];

  return (
    <ToastProvider>
      <ShopUIProvider>
        <CartProvider cartPromise={cartPromise}>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          {LIVE.announcementBar ? <AnnouncementBar settings={settings} /> : null}
          <Header teas={megaTeas} />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          {LIVE.newsletter ? <NewsletterBand /> : null}
          <Footer settings={settings} />
          <FloatingNav />
          <MobileMenu />
          <SearchOverlay />
          <CartDrawer threshold={settings.freeShippingThreshold} upsell={upsell} shopPay={e.shopPay} />
          <ConsentBanner />
          <RouteCurtain />
          <MotionRuntime />
        </CartProvider>
      </ShopUIProvider>
    </ToastProvider>
  );
}
