import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { MENU_HANDLES, SITE } from "@/lib/config/site";
import { getMenu } from "@/lib/data";
import { MENUS } from "@/lib/data/fixtures/data";
import { FamiliarToggle } from "./Familiar";
import { PaymentBadges } from "./PaymentBadges";
import styles from "./Footer.module.css";

const FALLBACK = MENUS.find((m) => m.handle === "footer")?.items ?? [];
const YEAR = new Date().getFullYear();

export async function Footer() {
  const menu = await getMenu(MENU_HANDLES.footer);
  const columns = menu?.items.length ? menu.items : FALLBACK;

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Logo variant="large" tone="reversed" width={180} />
            <p className="tagline">{SITE.tagline}</p>
            <ul className={styles.social} aria-label="Social">
              <li>
                {SITE.social.instagram ? (
                  <a href={SITE.social.instagram} className={styles.socialLink} aria-label="Instagram" rel="noopener noreferrer" target="_blank">
                    <Icon name="instagram" />
                  </a>
                ) : (
                  <span className={styles.socialLink} title="Instagram · profile link pending">
                    <Icon name="instagram" label="Instagram (link pending)" />
                  </span>
                )}
              </li>
              {/* Official TikTok and Pinterest marks are pending; dashed slots hold their place. */}
              <li>
                <span className={styles.socialLink} title="TikTok · official mark pending">
                  <span className={styles.pendingMark} role="img" aria-label="TikTok (pending)" />
                </span>
              </li>
              <li>
                <span className={styles.socialLink} title="Pinterest · official mark pending">
                  <span className={styles.pendingMark} role="img" aria-label="Pinterest (pending)" />
                </span>
              </li>
            </ul>
          </div>
          {columns.map((col) => (
            <nav key={col.id} aria-label={col.title} className={styles.column}>
              <h2 className="label">{col.title}</h2>
              <ul>
                {col.items.map((l) => (
                  <li key={l.id}>
                    <Link href={l.href} className={styles.link}>
                      {l.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className={styles.rule} />
        <div className={styles.base}>
          <p>
            © {YEAR} WITCHA MATCHA · ABN [pending] · Prices in AUD incl. GST
          </p>
          <FamiliarToggle className={styles.toggle} />
          <PaymentBadges />
        </div>
      </div>
    </footer>
  );
}
