"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import styles from "@/components/content/Content.module.css";

export default function ShopError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className={styles.notFound} role="alert">
      <span className={styles.notFoundArch} aria-hidden="true" />
      <h1 className="heading-1">Something spilled.</h1>
      <p>This page didn’t load properly. Try again, or head back to the teas.</p>
      <div className={styles.actions}>
        <Button onClick={reset}>Try again</Button>
        <Button href="/collections/matcha" variant="secondary">
          Shop matcha
        </Button>
      </div>
      {error.digest ? <p className={styles.small}>Reference: {error.digest}</p> : null}
    </section>
  );
}
