import { CartDrawer, type EmptyCartTea } from "@/components/commerce/CartDrawer";
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
import { PixelFamiliar } from "@/components/motion/PixelFamiliar";
import { RouteCurtain } from "@/components/motion/RouteCurtain";
import { ToastProvider } from "@/components/ui/Toast";
import { readCart } from "@/lib/cart/server";
import { env } from "@/lib/config/env";
import { getProducts, getSiteSettings } from "@/lib/data/catalog";
import { eyebrow } from "@/lib/data/product";
import { socialReviews } from "@/lib/providers";

export default async function ShopLayout({ children }: LayoutProps<"/">) {
  const e = env();
  const [settings, products, reviews] = await Promise.all([getSiteSettings(), getProducts(), socialReviews.get()]);
  // Read at request time and streamed into the client cart; never awaited here so the shell stays static.
  const cartPromise = readCart();
  const accountUrl = "/account";

  const teas = products.filter((p) => p.kind === "tea" && p.taste);
  const megaTeas: MegaTea[] = teas
    // One marker per stop so arches never sit on top of each other.
    .filter((p, i, all) => all.findIndex((q) => q.taste!.position === p.taste!.position) === i)
    .map((p) => ({ handle: p.handle, title: p.title, position: p.taste!.position, word: p.taste!.word }));
  const emptyTeas: EmptyCartTea[] = teas.slice(0, 2).map((p) => ({
    handle: p.handle,
    title: p.title,
    eyebrow: eyebrow(p),
    tin: p.tin ? { url: p.tin.url, alt: p.tin.alt } : null,
  }));
  const upsell = toUpsellItems(products);

  return (
    <ToastProvider>
      <ShopUIProvider>
        <CartProvider cartPromise={cartPromise}>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <AnnouncementBar settings={settings} />
          <Header teas={megaTeas} />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <NewsletterBand />
          <Footer settings={settings} reviews={reviews} accountUrl={accountUrl} />
          <FloatingNav />
          <MobileMenu accountUrl={accountUrl} />
          <SearchOverlay />
          <CartDrawer threshold={settings.freeShippingThreshold} upsell={upsell} emptyTeas={emptyTeas} shopPay={e.shopPay} />
          <ConsentBanner />
          <RouteCurtain />
          <MotionRuntime />
          {e.pixelCat ? <PixelFamiliar /> : null}
        </CartProvider>
      </ShopUIProvider>
    </ToastProvider>
  );
}
