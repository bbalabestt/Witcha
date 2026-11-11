"use client";

import { Button } from "@/components/ui/Button";
import { TEAS_HREF } from "@/lib/config/site";
import styles from "@/components/content/NotFoundContent.module.css";

/** Plain by default (copy v5.3 §8), with a next step. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className={`container ${styles.page}`}>
      <h1 className="heading-1">Something went wrong.</h1>
            <div className={styles.actions}>
        <Button size="xl" onClick={reset}>
          Try again
        </Button>
        <Button href={TEAS_HREF} variant="secondary" size="xl">
          Shop the teas
        </Button>
      </div>
    </section>
  );
}
