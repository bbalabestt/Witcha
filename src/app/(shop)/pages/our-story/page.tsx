import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { LIVE } from "@/lib/config/launch";
import { TEAS_HREF } from "@/lib/config/site";
import styles from "../pages.module.css";

export const metadata: Metadata = { title: "Our Story | WITCHA MATCHA", robots: { index: false, follow: false } };

/** Held until the founders supply the story (checklist §9). Add it here, inside its guardrails, then flip the flag. */
export default function OurStoryPage() {
  if (!LIVE.ourStory) notFound();
  return (
    <section className={`container ${styles.story}`}>
      <h1 className={styles.display}>Our story</h1>
      <div>
        <Button href={TEAS_HREF} size="xl">
          Shop the teas
        </Button>
      </div>
    </section>
  );
}
