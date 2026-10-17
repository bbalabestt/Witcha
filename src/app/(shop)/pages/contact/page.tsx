import type { Metadata } from "next";
import { ContactForm } from "@/components/content/ContactForm";
import { HelpLayout } from "@/components/content/HelpLayout";
import { getSiteSettings } from "@/lib/data/catalog";
import styles from "@/components/content/HelpLayout.module.css";

export const metadata: Metadata = { title: "Contact", alternates: { canonical: "/pages/contact" } };

export default async function ContactPage() {
  const s = await getSiteSettings();
  return (
    <HelpLayout title="Contact" current="/pages/contact">
      <div className={styles.contact}>
        <ContactForm />
        <aside className={styles.aside}>
          <span className="label">We reply within {s.replyTime}</span>
          <span>{s.supportEmail}</span>
          <span className="body-small">
            WITCHA MATCHA · ABN {s.abn} · {s.dispatchCity}, Australia
          </span>
        </aside>
      </div>
    </HelpLayout>
  );
}
