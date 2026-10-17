import type { Metadata } from "next";
import { HelpLayout } from "@/components/content/HelpLayout";
import { Button } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Disclosure";
import { getFaq } from "@/lib/data/catalog";
import styles from "@/components/content/HelpLayout.module.css";

export const metadata: Metadata = { title: "FAQ", alternates: { canonical: "/pages/faq" } };

export default async function FaqPage() {
  const faq = await getFaq();
  return (
    <HelpLayout title="Help & FAQ" current="/pages/faq">
      <Accordion defaultOpen={faq[1] ? [faq[1].id] : []} items={faq.map((f) => ({ id: f.id, title: f.question, content: <p>{f.answer}</p> }))} />
      <div className={styles.prompt}>
        <p>Still wondering?</p>
        <Button href="/pages/contact" variant="secondary" size="md">
          Contact us
        </Button>
      </div>
    </HelpLayout>
  );
}
