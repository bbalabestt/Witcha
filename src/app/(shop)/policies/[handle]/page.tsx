import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/Frame";
import { getPolicy } from "@/lib/data";
import styles from "@/components/content/Content.module.css";

const HANDLES = ["privacy-policy", "terms-of-service", "refund-policy", "shipping-policy"];

export function generateStaticParams() {
  return HANDLES.map((handle) => ({ handle }));
}

export async function generateMetadata({ params }: PageProps<"/policies/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const p = await getPolicy(handle);
  return p ? { title: p.title, alternates: { canonical: `/policies/${handle}` } } : { title: "Not found" };
}

export default function PolicyPage({ params }: PageProps<"/policies/[handle]">) {
  return (
    <Suspense
      fallback={
        <div className={styles.policy} aria-busy="true">
          <Skeleton width="60%" height={50} />
          <Skeleton height={200} />
        </div>
      }
    >
      <Policy params={params} />
    </Suspense>
  );
}

/** PolicyLayout: Shopify shop policies (Settings → Policies), sanitised. */
async function Policy({ params }: Pick<PageProps<"/policies/[handle]">, "params">) {
  const { handle } = await params;
  const policy = await getPolicy(handle);
  if (!policy) notFound();
  return (
    <article className={styles.policy}>
      <h1 className="heading-1">{policy.title}</h1>
      <div className={styles.body} dangerouslySetInnerHTML={{ __html: policy.bodyHtml }} />
    </article>
  );
}
