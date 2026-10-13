import type { Metadata } from "next";
import { HelpLayout } from "@/components/content/HelpLayout";
import { Accordion } from "@/components/ui/Disclosure";
import { getFaqEntries } from "@/lib/data";
import { JsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Lattes, storage, cost per cup, delivery times and gifts: answers to the common questions.",
  alternates: { canonical: "/pages/faq" },
};

export default async function FaqPage() {
  const faq = await getFaqEntries();
  return (
    <HelpLayout current="/pages/faq">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq
            .filter((f) => !/\[[^\]]+\]/.test(f.answer))
            .map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
        }}
      />
      <Accordion items={faq.map((f) => ({ id: f.id, title: f.question, content: <p>{f.answer}</p> }))} defaultOpen={faq[1] ? [faq[1].id] : []} />
    </HelpLayout>
  );
}
