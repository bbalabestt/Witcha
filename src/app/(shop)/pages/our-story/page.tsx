import type { Metadata } from "next";
import { Pending } from "@/components/content/PageHeader";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/Frame";
import styles from "@/components/content/Content.module.css";

export const metadata: Metadata = {
  title: "Our Story",
  description: "Two founders, one very particular palate: how WITCHA MATCHA chooses its teas.",
  alternates: { canonical: "/pages/our-story" },
};

export default function OurStoryPage() {
  return (
    <>
      <section className={[styles.section, styles.storyGrid].join(" ")}>
        <div className={styles.prose}>
          <span className="label">Our story</span>
          <h1 className="heading-1">Two founders, one very particular palate</h1>
          <p>
            [Founder story, 60–80 words.] We started WITCHA MATCHA to make good matcha feel easy and a little enchanting at home. <Pending>Confirm detail</Pending>
          </p>
        </div>
        <div className={styles.photos}>
          <ImagePlaceholder label="Founder photo" ratio="4:5" />
          <ImagePlaceholder label="Founder photo" ratio="4:5" />
        </div>
      </section>
      <section className={styles.bandBrand} aria-label="How we choose">
        <div className={styles.section}>
          <ol className={styles.principles}>
            <li>
              <span className={styles.bigNo} aria-hidden="true">
                1
              </span>
              <h2 className="heading-3">Pop tastes everything</h2>
              <p>Each tea is whisked, frothed and iced before it earns a tin.</p>
            </li>
            <li>
              <span className={styles.bigNo} aria-hidden="true">
                2
              </span>
              <h2 className="heading-3">Sourced from Yame</h2>
              <p>
                [Sourcing facts: farm, relationship, harvest timing.] <Pending />
              </p>
            </li>
            <li>
              <span className={styles.bigNo} aria-hidden="true">
                3
              </span>
              <h2 className="heading-3">Placed on the scale</h2>
              <p>Bright or deep, so you can choose by taste rather than jargon.</p>
            </li>
          </ol>
        </div>
      </section>
      <div className={[styles.section, styles.ctaRow].join(" ")}>
        <Button href="/collections/matcha">Shop the matcha</Button>
      </div>
    </>
  );
}
