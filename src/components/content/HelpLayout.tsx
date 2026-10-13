import type { ReactNode } from "react";
import { TabLinks } from "@/components/ui/Disclosure";
import styles from "./Content.module.css";

const TABS = [
  { href: "/pages/faq", label: "FAQ" },
  { href: "/pages/shipping-returns", label: "Shipping & Returns" },
  { href: "/pages/contact", label: "Contact" },
];

/** Prototype "Help" page with its tab row; each tab is its own route (DEVIATIONS D-07). */
export function HelpLayout({ current, children }: { current: string; children: ReactNode }) {
  return (
    <section className={styles.help}>
      <h1 className="heading-1">Help</h1>
      <TabLinks items={TABS} current={current} label="Help topics" />
      <div className={styles.helpBody}>{children}</div>
    </section>
  );
}
