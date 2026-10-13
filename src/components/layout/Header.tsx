import type { TasteMarker } from "@/components/commerce/TasteScale";
import { MENU_HANDLES } from "@/lib/config/site";
import { getCollection, getMenu, getSiteSettings } from "@/lib/data";
import { tasteText } from "@/lib/data/product";
import type { MenuItem } from "@/lib/data/types";
import { MENUS } from "@/lib/data/fixtures/data";
import { CartButton } from "@/components/cart/CartButton";
import { AnnouncementBar } from "./AnnouncementBar";
import { Suspense } from "react";
import { HeaderBar, HeaderBarWithPath } from "./HeaderBar";

/** Used when the Shopify menu is missing so the site never renders without navigation. */
const FALLBACK_NAV: MenuItem[] = MENUS.find((m) => m.handle === "main-menu")?.items ?? [];

export async function Header() {
  const [menu, settings, matcha] = await Promise.all([getMenu(MENU_HANDLES.main), getSiteSettings(), getCollection("matcha", { first: 12 })]);
  const teaMarkers: TasteMarker[] = (matcha?.products.nodes ?? [])
    .filter((p) => p.taste)
    .map((p) => ({ position: p.taste!.position, label: `${p.title}, ${tasteText(p.taste!)}`, href: `/products/${p.handle}` }));

  const nav = menu?.items.length ? menu.items : FALLBACK_NAV;
  return (
    <header>
      <AnnouncementBar settings={settings} />
      <Suspense fallback={<HeaderBar nav={nav} teaMarkers={teaMarkers} cart={<CartButton />} pathname={null} />}>
        <HeaderBarWithPath nav={nav} teaMarkers={teaMarkers} cart={<CartButton />} />
      </Suspense>
    </header>
  );
}
