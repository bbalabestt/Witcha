import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import type { SiteSettings } from "@/lib/data/types";
import type { SocialReviews } from "@/lib/providers";
import { FooterReviews } from "./FooterReviews";
import styles from "./Footer.module.css";

const PAYMENTS = ["Visa", "Mastercard", "Amex", "Apple Pay", "Google Pay", "Shop Pay", "PayPal", "Afterpay"];

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/collections/matcha", label: "Shop Matcha" },
      { href: "/collections/gifts", label: "Gifts" },
      { href: "/collections/accessories", label: "Accessories" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/blogs/brewing-guides", label: "Brewing Guides" },
      { href: "/pages/academy", label: "Witcha Academy" },
      { href: "/pages/our-story", label: "Our Story" },
    ],
  },
];

export function Footer({ settings, reviews, accountUrl }: { settings: SiteSettings; reviews: SocialReviews; accountUrl: string }) {
  const showReviews = reviews.reviews.length > 0;
  return (
    <footer className={styles.footer} data-surface-dark="">
      <div className={`container ${styles.inner}`}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Logo variant="large" tone="reversed" width={180} />
            <p className="tagline">Matcha, With Taste.</p>
            <div className={styles.social}>
              <a href="https://instagram.com/" className={styles.socialLink} aria-label="Instagram">
                <Icon name="instagram" />
              </a>
              {/* Official TikTok and Pinterest marks come from each platform's brand kit (pending). */}
              <span className={styles.socialLink} title="TikTok · official mark pending">
                <span className={styles.markPending} aria-hidden="true" />
                <span className="visually-hidden">TikTok (link pending)</span>
              </span>
              <span className={styles.socialLink} title="Pinterest · official mark pending">
                <span className={styles.markPending} aria-hidden="true" />
                <span className="visually-hidden">Pinterest (link pending)</span>
              </span>
            </div>
          </div>
          {COLUMNS.map((c) => (
            <nav key={c.title} aria-label={c.title} className={styles.column}>
              <span className="label">{c.title}</span>
              {c.links.map((l) => (
                <Link key={l.href} href={l.href}>
                  {l.label}
                </Link>
              ))}
            </nav>
          ))}
          <nav aria-label="Help" className={styles.column}>
            <span className="label">Help</span>
            <Link href="/pages/faq">FAQ</Link>
            <Link href="/pages/shipping-returns">Shipping &amp; Returns</Link>
            <Link href="/pages/contact">Contact</Link>
            <span className={styles.policies}>
              <Link href="/policies/privacy-policy">Privacy</Link> · <Link href="/policies/terms-of-service">Terms</Link> ·{" "}
              <Link href="/policies/refund-policy">Refunds</Link>
            </span>
            <a href={accountUrl}>Sign in</a>
          </nav>
        </div>

        {showReviews ? <FooterReviews reviews={reviews} /> : null}

        <div className={styles.gold} />
        <div className={styles.bottom}>
          <span>© 2026 WITCHA MATCHA · ABN {settings.abn} · Prices in AUD incl. GST</span>
          <ul className={styles.payments} aria-label="Payment methods">
            {PAYMENTS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
