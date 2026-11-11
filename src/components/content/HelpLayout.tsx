import type { ReactNode } from "react";
import { TabLinks } from "@/components/ui/Disclosure";
import { HELP_LINKS } from "@/lib/config/site";
import styles from "./HelpLayout.module.css";

/** Help routes share one layout. The tab row only shows once there is more than one live page. */
export function HelpLayout({ title, current, children }: { title: string; current: string; children: ReactNode }) {
  return (
    <section className={`container ${styles.help}`}>
      <h1 className="heading-1">
        {title}
      </h1>
      {HELP_LINKS.length > 1 ? <TabLinks items={HELP_LINKS} current={current} label="Help pages" /> : null}
      <div className={styles.body}>{children}</div>
    </section>
  );
}
