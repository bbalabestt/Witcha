import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/content/ContactForm";
import { HelpLayout } from "@/components/content/HelpLayout";
import { LIVE } from "@/lib/config/launch";
import { SEO } from "@/lib/content/seo";
import { getSiteSettings } from "@/lib/data/catalog";
import styles from "@/components/content/HelpLayout.module.css";

export const metadata: Metadata = { ...SEO.contact, alternates: { canonical: "/pages/contact" } };

/** Live only when the form sends and the support email and reply time are confirmed. */
export default async function ContactPage() {
  if (!LIVE.contact) notFound();
  const s = await getSiteSettings();
  return (
    <HelpLayout title="Get in touch." current="/pages/contact">
      <p>Have a question about our teas or your order? Send us a message below.</p>
      <div className={styles.contact}>
        <ContactForm />
        <aside className={styles.aside}>
          {s.replyTime ? <span className="label">We reply within {s.replyTime}</span> : null}
          {s.supportEmail ? <span>{s.supportEmail}</span> : null}
          <span className="body-small">
            {s.legalEntity} · ABN {s.abn}
          </span>
        </aside>
      </div>
    </HelpLayout>
  );
}
