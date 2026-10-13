import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm, ContactFormFromUrl } from "@/components/content/ContactForm";
import { HelpLayout } from "@/components/content/HelpLayout";
import { SITE } from "@/lib/config/site";
import { getSiteSettings } from "@/lib/data";
import styles from "@/components/content/Content.module.css";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about a tea, an order or a gift? Send us a note.",
  alternates: { canonical: "/pages/contact" },
};

export default async function ContactPage() {
  const s = await getSiteSettings();
  return (
    <HelpLayout current="/pages/contact">
      <div className={styles.contactGrid}>
        <Suspense fallback={<ContactForm topic={null} product={null} />}>
          <ContactFormFromUrl />
        </Suspense>
        <aside className={styles.contactAside} aria-label="Contact details">
          <span className="label">We reply within {s.replyTime}</span>
          <p>{s.supportEmail}</p>
          <p className={styles.small}>
            {SITE.name} · ABN [pending] · {s.dispatchCity}, Australia
          </p>
        </aside>
      </div>
    </HelpLayout>
  );
}
