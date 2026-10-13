import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import styles from "@/components/content/Content.module.css";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <section className={styles.notFound}>
      <span className={styles.notFoundArch} aria-hidden="true" />
      <h1 className="heading-1">This page wandered off.</h1>
      <p>It may still be in preparation, or the link has changed.</p>
      <div className={styles.actions}>
        <Button href="/collections/matcha">Shop matcha</Button>
        <Button href="/" variant="secondary">
          Home
        </Button>
      </div>
    </section>
  );
}
