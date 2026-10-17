"use client";

import { Button } from "@/components/ui/Button";
import styles from "@/components/content/NotFoundContent.module.css";

/** Plain words and a next step (brief: every error tells the shopper what to do next). */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className={`container ${styles.page}`}>
      <h1 className="heading-1">Something spilled.</h1>
      <p>This page didn’t load. Try again, or head back to the teas.</p>
      <div className={styles.actions}>
        <Button size="xl" onClick={reset}>
          Try again
        </Button>
        <Button href="/collections/matcha" variant="secondary" size="xl">
          Shop matcha
        </Button>
      </div>
    </section>
  );
}
