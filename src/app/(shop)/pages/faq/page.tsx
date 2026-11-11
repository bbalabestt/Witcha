import type { Metadata } from "next";
import { FaqAnswer } from "@/components/content/FaqAnswer";
import { HelpLayout } from "@/components/content/HelpLayout";
import { Accordion } from "@/components/ui/Disclosure";
import { SEO } from "@/lib/content/seo";
import { getFaq } from "@/lib/data/catalog";

export const metadata: Metadata = { ...SEO.faq, alternates: { canonical: "/pages/faq" } };

export default async function FaqPage() {
  const faq = await getFaq();
  return (
    <HelpLayout title="FAQ" current="/pages/faq">
      <Accordion defaultOpen={faq[0] ? [faq[0].id] : []} items={faq.map((f) => ({ id: f.id, title: f.question, content: <FaqAnswer text={f.answer} /> }))} />
    </HelpLayout>
  );
}
