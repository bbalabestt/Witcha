import type { ReactNode } from "react";
import { Breadcrumb, type Crumb } from "@/components/ui/Navigation";
import styles from "./Content.module.css";

/** Coloured page header: eyebrow, h1, intro. */
export function PageHeader({
  eyebrow,
  title,
  intro,
  tone = "brand",
  align = "start",
  crumbs,
}: {
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  tone?: "brand" | "soft" | "page";
  align?: "start" | "center";
  crumbs?: Crumb[];
}) {
  return (
    <section className={[styles.header, styles[`header_${tone}`]].join(" ")}>
      <div className={[styles.headerInner, align === "center" ? styles.center : undefined].filter(Boolean).join(" ")}>
        {crumbs ? <Breadcrumb items={crumbs} /> : null}
        {eyebrow ? <span className="label">{eyebrow}</span> : null}
        <h1 className="heading-1">{title}</h1>
        {intro ? <div className={styles.intro}>{intro}</div> : null}
      </div>
    </section>
  );
}

export function Pending({ children = "Pending" }: { children?: ReactNode }) {
  return <span className={styles.pending}>{children}</span>;
}
