import Link from "next/link";
import { Accordion, Tabs } from "@/components/ui/Disclosure";
import { ImagePlaceholder } from "@/components/ui/Frame";
import { Icon, type IconName } from "@/components/ui/Icon";
import { MediaFrame } from "@/components/ui/MediaThumb";
import { BLOG_HANDLE } from "@/lib/config/site";
import { productEyebrow } from "@/lib/data/product";
import type { FaqEntry, PrepMethod, Product, ProductFacts } from "@/lib/data/types";
import type { ReviewSummary } from "@/lib/providers";
import styles from "./Pdp.module.css";

export const PDP_ANCHORS = [
  { id: "pdp-tea", label: "The tea" },
  { id: "pdp-make", label: "Make it" },
  { id: "pdp-store", label: "Storage" },
  { id: "pdp-char", label: "Meet {character}" },
  { id: "pdp-reviews", label: "Reviews" },
  { id: "pdp-faq", label: "FAQ" },
] as const;

/** Sticky in-page navigation (wide screens only, as in the prototype). */
export function AnchorNav({ product }: { product: Product }) {
  const anchors = PDP_ANCHORS.filter((a) => {
    if (a.id === "pdp-make") return product.prepMethods.length > 0;
    if (a.id === "pdp-char") return product.character !== null;
    if (a.id === "pdp-tea" || a.id === "pdp-store") return product.kind === "tea";
    return true;
  });
  return (
    <nav className={styles.anchors} aria-label="On this page">
      <ul>
        {anchors.map((a) => (
          <li key={a.id}>
            <a href={`#${a.id}`}>{a.label.replace("{character}", product.character?.name ?? "")}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

const FACT_ROWS: Array<[keyof ProductFacts, string]> = [
  ["originRegion", "Origin"],
  ["cultivar", "Cultivar"],
  ["harvest", "Harvest"],
  ["grade", "Grade"],
  ["netWeight", "Net weight"],
  ["packDateNote", "Pack date"],
  ["ingredients", "Ingredients"],
];

export function FactTable({ facts }: { facts: ProductFacts }) {
  const rows = FACT_ROWS.filter(([k]) => facts[k]);
  if (!rows.length) return null;
  return (
    <dl className={styles.facts}>
      {rows.map(([k, label]) => (
        <div key={k} className={styles.factRow}>
          <dt>{label}</dt>
          <dd>{facts[k]}</dd>
        </div>
      ))}
    </dl>
  );
}

export function TheTea({ product }: { product: Product }) {
  return (
    <section id="pdp-tea" className={[styles.section, styles.teaGrid].join(" ")}>
      <div className={styles.prose}>
        <span className="label">The tea</span>
        <h2 className="heading-2">{product.taste ? `${product.taste.word}, and honest about it` : product.title}</h2>
        <div className={styles.description} dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
      </div>
      <FactTable facts={product.facts} />
      <MediaFrame media={product.media[1] ?? null} ratio="4:5" sizes="(max-width: 900px) 100vw, 33vw" fallbackLabel="Powder colour · fact shot" />
    </section>
  );
}

function PrepPanel({ prep }: { prep: PrepMethod }) {
  const facts: Array<[IconName, string, string]> = [
    ["scale", "Matcha", prep.grams],
    ["thermometer", "Water", prep.water],
    ["cup", "Milk", prep.milk],
    ["clock", "Time", prep.time],
  ];
  return (
    <div className={styles.prepGrid}>
      <div className={styles.prepMain}>
        <dl className={styles.prepFacts}>
          {facts.map(([icon, label, value]) => (
            <div key={label}>
              <Icon name={icon} size={22} />
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <ol className={styles.steps}>
          {prep.steps.map((s, i) => (
            <li key={i}>
              <span className={styles.stepNo} aria-hidden="true">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
        <Link href={`/blogs/${BLOG_HANDLE}/clumps-bitterness-dull-colour-fixes`}>Clumps, bitterness or dull colour? Here’s the gentle fix.</Link>
      </div>
      {prep.videoUrl ? (
        <video className={styles.video} src={prep.videoUrl} controls preload="none" playsInline aria-label={`60-second video: ${prep.method}`} />
      ) : (
        <div className={styles.videoPlaceholder} role="img" aria-label={`Video placeholder: 60-second ${prep.method} video`}>
          <span className={styles.play} aria-hidden="true">
            <Icon name="play" size={26} />
          </span>
          <span aria-hidden="true">60-second video · {prep.method}</span>
        </div>
      )}
    </div>
  );
}

export function MakeIt({ methods }: { methods: PrepMethod[] }) {
  if (!methods.length) return null;
  return (
    <section id="pdp-make" className={styles.makeBand}>
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <span className="label">Make it</span>
          <h2 className="heading-2">{methods.length === 4 ? "Four ways, all measured" : "Ways to make it, all measured"}</h2>
        </div>
        <Tabs label="Preparation methods" items={methods.map((m) => ({ id: m.icon, label: m.method.toUpperCase(), panel: <PrepPanel prep={m} /> }))} />
      </div>
    </section>
  );
}

export function Storage({ note }: { note: string | null }) {
  const items: Array<[IconName, string, string]> = [
    ["cool", "Cool.", "Away from the stove and sunlight."],
    ["dry", "Dry.", "Use a dry scoop, every time."],
    ["sealed", "Closed tight.", "Best within [opened shelf-life, to be confirmed]."],
  ];
  return (
    <section id="pdp-store" className={styles.section}>
      <h2 className="heading-2">Storage and freshness</h2>
      <ul className={styles.storage}>
        {items.map(([icon, lead, text]) => (
          <li key={lead}>
            <Icon name={icon} size={28} />
            <span>
              <b>{lead}</b> {text}
            </span>
          </li>
        ))}
      </ul>
      {note ? <p className={styles.prose}>{note}</p> : null}
    </section>
  );
}

export function CharacterPanel({ product }: { product: Product }) {
  const c = product.character;
  if (!c) return null;
  return (
    <section id="pdp-char" className={styles.charBand}>
      <div className={[styles.section, styles.charGrid].join(" ")}>
        <div className={styles.charArt}>
          {c.art.kind === "placeholder" ? <ImagePlaceholder label={c.art.label} shape="arch" tone="page" showRatio={false} /> : <MediaFrame media={c.art} ratio="3:4" sizes="300px" className={styles.archImage} />}
        </div>
        <div className={styles.prose}>
          <span className="label">Keeper of the {productEyebrow(product)} tea</span>
          <h2 className="heading-2">Meet {c.name}</h2>
          <p>
            {c.story}
            {c.accessory ? ` ${c.accessory}` : ""}
          </p>
          <Link href="/pages/academy" className={styles.textCta}>
            Visit the Academy
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Zero-state until a reviews provider is connected. Never fabricated. */
export function Reviews({ summary, productTitle }: { summary: ReviewSummary; productTitle: string }) {
  return (
    <section id="pdp-reviews" className={styles.section}>
      <h2 className="heading-2">Reviews</h2>
      {summary.count === 0 ? (
        <div className={styles.reviewsEmpty}>
          <div>
            <p className="heading-3">No reviews yet.</p>
            <p>Be the first to share how you made it.</p>
          </div>
          <Link href={`/pages/contact?topic=review&product=${encodeURIComponent(productTitle)}`} className={styles.secondaryLink}>
            Write a review
          </Link>
        </div>
      ) : null}
    </section>
  );
}

export function Questions({ faq }: { faq: FaqEntry[] }) {
  if (!faq.length) return null;
  return (
    <section id="pdp-faq" className={[styles.section, styles.faq].join(" ")}>
      <h2 className="heading-2">Questions</h2>
      <Accordion items={faq.map((f) => ({ id: f.id, title: f.question, content: <p>{f.answer}</p> }))} defaultOpen={faq[1] ? [faq[1].id] : []} />
    </section>
  );
}
