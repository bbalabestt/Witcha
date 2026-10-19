import type { Metadata } from "next";
import { HelpLayout } from "@/components/content/HelpLayout";
import { Accordion } from "@/components/ui/Disclosure";
import { getFaq } from "@/lib/data/catalog";

export const metadata: Metadata = { title: "FAQ", alternates: { canonical: "/pages/faq" } };

export default async function FaqPage() {
  const faq = await getFaq();
  return (
    <HelpLayout title="FAQ" current="/pages/faq">
      <Accordion defaultOpen={faq[1] ? [faq[1].id] : []} items={faq.map((f) => ({ id: f.id, title: f.question, content: <p>{f.answer}</p> }))} />
    </HelpLayout>
  );
}
