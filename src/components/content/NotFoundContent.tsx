import Image from "next/image";
import { Button } from "@/components/ui/Button";
import styles from "./NotFoundContent.module.css";

/** One calm line, the Dreamer in an arch, and the way back. */
export function NotFoundContent() {
  return (
    <section className={`container ${styles.page}`}>
      <div className={styles.arch} data-reveal="rise">
        <Image src="/art/05-fifth-sku-concept-key-visual.webp" alt="The Dreamer, a cream-and-blush cat, looking out of a garden window." fill sizes="200px" className={styles.contain} />
      </div>
      <h1 className="heading-1" data-reveal="up">
        This page wandered off.
      </h1>
      <p data-reveal="up">It may still be in preparation, or the link has changed.</p>
      <div className={styles.actions} data-reveal="up">
        <Button href="/collections/matcha" size="xl">
          Shop matcha
        </Button>
        <Button href="/" variant="secondary" size="xl">
          Home
        </Button>
      </div>
    </section>
  );
}
