import type { ReactNode } from "react";
import { TabLinks } from "@/components/ui/Disclosure";
import { HELP_LINKS } from "@/lib/config/site";
import styles from "./HelpLayout.module.css";

/** Help is three routes sharing one layout; V4's tab row becomes links, the active one underlined (V2.1 6.1). */
export function HelpLayout({ title, current, children }: { title: string; current: string; children: ReactNode }) {
  return (
    <section className={`container ${styles.help}`}>
      <h1 className="heading-1" data-reveal="up">
        {title}
      </h1>
      <TabLinks items={[...HELP_LINKS]} current={current} label="Help pages" />
      <div className={styles.body}>{children}</div>
    </section>
  );
}
