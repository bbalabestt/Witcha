import type { Metadata } from "next";
import { NewsletterForm } from "@/components/layout/NewsletterForm";
import { Logo } from "@/components/ui/Logo";
import { SITE } from "@/lib/config/site";
import styles from "./page.module.css";

export const metadata: Metadata = { title: { absolute: `${SITE.name} · Coming soon` }, robots: { index: false, follow: false } };

/** Launch is gated, not dated: no countdown, no discount, just the letter. */
export default function ComingSoon() {
  return (
    <main className={styles.page}>
      <div className={styles.arch}>
        <Logo variant="large" width={220} />
        <p className="tagline">{SITE.tagline}</p>
        <h1 className="heading-2">The Academy is getting ready.</h1>
        <p>Leave your email and a letter will tell you when the first tins are on the shelf.</p>
        <NewsletterForm />
      </div>
    </main>
  );
}
