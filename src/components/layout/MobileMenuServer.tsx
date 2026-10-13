import { MENU_HANDLES, SITE } from "@/lib/config/site";
import { getMenu } from "@/lib/data";
import { MENUS } from "@/lib/data/fixtures/data";
import { MobileMenu } from "./MobileMenu";

const HELP = { id: "help", title: "Help & FAQ", href: "/pages/faq", items: [] };

export async function MobileMenuServer() {
  const menu = await getMenu(MENU_HANDLES.main);
  const top = (menu?.items.length ? menu.items : (MENUS.find((m) => m.handle === "main-menu")?.items ?? [])).map((i) => ({ ...i, items: [] }));
  return <MobileMenu links={[...top, HELP]} accountHref={SITE.accountPath} tagline={SITE.tagline} />;
}
