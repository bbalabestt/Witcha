import Link from "next/link";
import { LiquidEdge } from "@/components/motion/LiquidEdge";
import { MotionToggle } from "@/components/motion/MotionToggle";
import { Logo } from "@/components/ui/Logo";
import { LIVE } from "@/lib/config/launch";
import { SOCIAL, TEAS_HREF } from "@/lib/config/site";
import type { SiteSettings } from "@/lib/data/types";
import styles from "./Footer.module.css";

const PAYMENTS = ["Visa", "Mastercard", "Apple Pay", "Afterpay"];

const COLUMNS = [
  { title: "Shop", links: [{ href: TEAS_HREF, label: "Japanese matcha and hojicha" }] },
  {
    title: "Learn",
    links: [
      { href: "/pages/academy", label: "Witcha Academy" },
      { href: "/pages/faq", label: "FAQ" },
      ...(LIVE.guides ? [{ href: "/blogs/brewing-guides", label: "Brewing Guides" }] : []),
      ...(LIVE.ourStory ? [{ href: "/pages/our-story", label: "Our Story" }] : []),
      ...(LIVE.shippingReturns ? [{ href: "/pages/shipping-returns", label: "Shipping & Returns" }] : []),
      ...(LIVE.contact ? [{ href: "/pages/contact", label: "Contact" }] : []),
    ],
  },
];

export function Footer({ settings }: { settings: SiteSettings }) {
  const social = SOCIAL.filter((s) => s.href);
  return (
    <footer className={styles.footer}>
      <LiquidEdge side="top" />
      <div className={`container ${styles.inner}`}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Logo variant="large" width={180} />
            <p className="tagline">Matcha, With Taste.</p>
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
          {social.length ? (
            <nav aria-label="Follow" className={styles.column}>
              <span className="label">Follow</span>
              {social.map((s) => (
                <a key={s.label} href={s.href ?? undefined}>
                  {s.label}
                </a>
              ))}
            </nav>
          ) : null}
        </div>

        <div className={styles.rule} />
        <div className={styles.bottom}>
          <span>
            © 2026 {settings.legalEntity} · ABN {settings.abn}
          </span>
          <MotionToggle showText />
          {LIVE.policies ? (
            <span className={styles.policies}>
              <Link href="/policies/privacy-policy">Privacy</Link> · <Link href="/policies/terms-of-service">Terms</Link> ·{" "}
              <Link href="/policies/refund-policy">Refunds</Link>
            </span>
          ) : null}
          {LIVE.paymentBadges ? (
            <ul className={styles.payments} aria-label="Payment methods">
              {PAYMENTS.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
