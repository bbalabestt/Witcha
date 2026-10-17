import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import styles from "../pages.module.css";
import content from "../../content.module.css";

export const metadata: Metadata = {
  title: "Our Story",
  description: "Two founders, one very particular palate.",
  alternates: { canonical: "/pages/our-story" },
};

const STEPS = [
  ["Pop tastes everything", "Each tea is whisked, frothed and iced before it earns a tin.", false],
  ["Sourced from Yame", "[Sourcing facts: farm, relationship, harvest timing.]", true],
  ["Placed on the scale", "Bright or deep, so you can choose by taste rather than jargon.", false],
] as const;

export default function OurStoryPage() {
  return (
    <>
      <section className={`container ${styles.story}`}>
        <div className={styles.storyCopy}>
          <span className="label" data-reveal="up">
            Our story
          </span>
          <h1 className="heading-1" data-reveal="up">
            Two founders, one very particular palate
          </h1>
          <p data-reveal="up">
            [Founder story, 60–80 words.] We started WITCHA MATCHA to make good matcha feel easy and a little enchanting at home.{" "}
            <span className="pending-tag">Confirm detail</span>
          </p>
        </div>
        <div className={styles.founders}>
          <div className={styles.photo} role="img" aria-label="Image placeholder: founder photo, 4:5" data-reveal="up">
            Founder photo · 4:5
          </div>
          <div className={`${styles.photo} ${styles.offset}`} role="img" aria-label="Image placeholder: founder photo, 4:5" data-reveal="up" data-delay="120">
            Founder photo · 4:5
          </div>
        </div>
      </section>
      <section className={content.band}>
        <div className={`container ${styles.steps}`}>
          {STEPS.map(([title, text, pending], i) => (
            <div key={title} className={styles.step} data-reveal="up" data-delay={String(i * 100)}>
              <span className={styles.stepN}>{i + 1}</span>
              <span className={content.title3}>{title}</span>
              <p>
                {text} {pending ? <span className="pending-tag">Pending</span> : null}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className={`container ${styles.center}`}>
        <Button href="/collections/matcha" size="xl">
          Shop the matcha
        </Button>
      </section>
    </>
  );
}
