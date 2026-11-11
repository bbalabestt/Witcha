import type { Metadata } from "next";
import Link from "next/link";
import { LiquidEdge } from "@/components/motion/LiquidEdge";
import { Button } from "@/components/ui/Button";
import { LIVE } from "@/lib/config/launch";
import { ACADEMY_TITLES } from "@/lib/content/academy";
import { SEO } from "@/lib/content/seo";
import styles from "../pages.module.css";
import content from "../../content.module.css";

export const metadata: Metadata = { ...SEO.academy, alternates: { canonical: "/pages/academy" } };

/** Copy v5.3 §5. The whole page works without any cat artwork at launch. */
export default function AcademyPage() {
  return (
    <>
      <section className={content.band}>
        <div className={`container ${content.bandInner} ${content.bandCenter}`}>
          <h1 className={styles.display}>Witcha Academy</h1>
          <p className={content.lead}>
            Witcha Academy is where WITCHA MATCHA explores tea by taste. Each of our four teas carries a title that sums up its character, so it&apos;s easy to remember the one you liked and find your way to the next.
          </p>
        </div>
        <LiquidEdge />
      </section>

      <section className={`container ${content.section}`}>
        <h2 className="heading-2">The four titles</h2>
        <ul className={styles.titles}>
          {ACADEMY_TITLES.map((t) => (
            <li key={t.handle}>
              <Link href={`/products/${t.handle}`} className={styles.titleLink}>
                <span className={content.title3}>{t.name}</span>
                <span className="label">{t.character}</span>
                <span>{t.line}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.ruled}>
        <div className={`container ${content.section}`}>
          <h2 className="heading-2">Learn by tasting</h2>
          <p className={content.lead}>Try one tea two ways, straight and with milk, and notice what changes. Our recipes are a good place to start.</p>
          <div>
            <Button href="/pages/recipes" variant="secondary" size="xl">
              See the recipes
            </Button>
          </div>
        </div>
      </section>

      {LIVE.academyCat ? (
        <section className={styles.ruled}>
          <div className={`container ${content.section}`}>
            <h2 className="heading-2">The resident cat</h2>
            <p className={content.lead}>
              There is always room for another cup at the Academy. Our resident cat likes to know what&apos;s being made, appearing beside the tin before the first sip. Curious about every tea and content to keep you company, this familiar is part of the Academy&apos;s everyday life.
            </p>
          </div>
        </section>
      ) : null}
    </>
  );
}
