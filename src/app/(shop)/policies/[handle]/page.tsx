import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPolicies } from "@/lib/data/catalog";
import { sanitizeHtml } from "@/lib/html";
import styles from "./page.module.css";

export async function generateStaticParams() {
  return (await getPolicies()).map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: PageProps<"/policies/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const p = (await getPolicies()).find((x) => x.handle === handle);
  return p ? { title: p.title, alternates: { canonical: `/policies/${handle}` } } : {};
}

/** One template for Shopify shop policies: contents list on the left, a readable column on the right. */
export default async function PolicyPage({ params }: PageProps<"/policies/[handle]">) {
  const { handle } = await params;
  const policies = await getPolicies();
  const policy = policies.find((p) => p.handle === handle);
  if (!policy) notFound();
  return (
    <section className={`container ${styles.layout}`}>
      <nav aria-label="Policies" className={styles.toc}>
        <span className="label">Policies</span>
        {policies.map((p) => (
          <Link key={p.handle} href={`/policies/${p.handle}`} aria-current={p.handle === handle ? "page" : undefined}>
            {p.title}
          </Link>
        ))}
      </nav>
      <article className={styles.body}>
        <h1 className="heading-1">{policy.title}</h1>
        <div className={styles.prose} dangerouslySetInnerHTML={{ __html: sanitizeHtml(policy.body.includes("<") ? policy.body : `<p>${policy.body}</p>`) }} />
      </article>
    </section>
  );
}
