import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge, Chip } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { Accordion, Tabs } from "@/components/ui/Disclosure";
import { Checkbox, Select, TextInput, Textarea } from "@/components/ui/Field";
import { ArchFrame, ImagePlaceholder, Skeleton } from "@/components/ui/Frame";
import { Icon } from "@/components/ui/Icon";
import { iconMarkup, type IconName } from "@/components/ui/icons.generated";
import { Logo } from "@/components/ui/Logo";
import { Breadcrumb } from "@/components/ui/Navigation";
import { InPreparationCard, ProductCard } from "@/components/commerce/ProductCard";
import { PriceBlock } from "@/components/commerce/PriceBlock";
import { TasteScale } from "@/components/commerce/TasteScale";
import { PRODUCTS } from "@/lib/data/fixtures/data";
import { money } from "@/lib/data/money";
import { DevDemos } from "./DevDemos";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Component sheet", robots: { index: false, follow: false } };

const SWATCHES = [
  "brand-witcha-blue",
  "brand-aqua-light",
  "brand-deep-blue",
  "brand-ivory",
  "brand-gold",
  "brand-blush",
  "brand-sage",
  "action-primary-hover",
  "feedback-error",
] as const;

const TYPE_STYLES: Array<[string, string]> = [
  ["display-xl", "Which Matcha Today?"],
  ["heading-1", "Yame no Mukashi"],
  ["heading-2", "From the hills of Yame"],
  ["heading-3", "How to make it at home"],
  ["body", "Two grams, a splash of hot water, a quick froth."],
  ["body-small", "Free shipping over $[80.00]."],
  ["label", "Reserve · Deep"],
  ["tagline", "Matcha, With Taste."],
];

export default function ComponentSheet() {
  if (process.env.NODE_ENV === "production") notFound();
  const icons = Object.keys(iconMarkup) as IconName[];

  return (
    <main className={styles.page}>
      <header className={styles.stack}>
        <p className="label">Dev only · not built in production</p>
        <h1 className="heading-1">Component sheet</h1>
        <p className="body">Every primitive and state, for side-by-side comparison with Prototype V2.</p>
      </header>

      <section className={styles.section}>
        <h2 className="heading-2">Colour tokens</h2>
        <div className={styles.grid}>
          {SWATCHES.map((s) => (
            <div key={s} className={styles.swatch}>
              <span className={styles.swatchChip} style={{ background: `var(--${s})` }} />
              <code>--{s}</code>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="heading-2">Type styles</h2>
        {TYPE_STYLES.map(([cls, sample]) => (
          <div key={cls}>
            <p className={styles.caption}>.{cls}</p>
            <p className={cls}>{sample}</p>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <h2 className="heading-2">Logo</h2>
        <div className={styles.row}>
          <Logo variant="large" width={200} />
          <Logo variant="large" />
          <Logo variant="small" width={112} />
          <Logo variant="small-no-rules" />
        </div>
        <div className={[styles.row, styles.dark].join(" ")}>
          <Logo variant="large" tone="reversed" width={180} />
          <Logo variant="small" tone="reversed" />
          <Logo variant="small-no-rules" tone="reversed" />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="heading-2">Icons</h2>
        <div className={styles.grid}>
          {icons.map((n) => (
            <div key={n} className={styles.iconCell}>
              <Icon name={n} />
              <span>{n}</span>
            </div>
          ))}
        </div>
        <div className={[styles.row, styles.dark].join(" ")}>
          <Icon name="truck" /> <Icon name="lock" /> <Icon name="menu" /> <Icon name="instagram" label="Instagram" />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="heading-2">Buttons</h2>
        <div className={styles.row}>
          <Button>Shop the matcha</Button>
          <Button size="lg">Add to cart</Button>
          <Button size="md">Which Matcha Today?</Button>
          <Button size="sm">Add</Button>
          <Button disabled>Disabled</Button>
          <Button status="loading">Adding…</Button>
          <Button status="success">Added</Button>
        </div>
        <div className={styles.row}>
          <Button variant="secondary">Meet the Academy</Button>
          <Button variant="secondary" size="md">Write a review</Button>
          <Button variant="placeholder" size="xl">Shop Pay · rendered by Shopify</Button>
          <Button variant="link">All brewing guides</Button>
          <Button href="/dev/components" variant="secondary" size="md">
            Link button
          </Button>
        </div>
        <div className={styles.row}>
          <IconButton label="Search">
            <Icon name="search" />
          </IconButton>
          <IconButton label="Cart">
            <Icon name="cart" />
          </IconButton>
          <IconButton label="Close">
            <Icon name="close" />
          </IconButton>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="heading-2">Form fields</h2>
        <div className={styles.stack}>
          <TextInput label="Email" type="email" placeholder="name@example.com" size="lg" />
          <TextInput label="Email" type="email" defaultValue="name@" error="Check the email address, e.g. name@example.com." size="lg" />
          <TextInput label="Order number (optional)" hint="Starts with #WM." />
          <Textarea label="Message" rows={5} />
          <Select
            label="Sort"
            options={[
              { value: "featured", label: "Featured" },
              { value: "best", label: "Best selling" },
              { value: "low", label: "Price, low to high" },
              { value: "high", label: "Price, high to low" },
              { value: "new", label: "Newest" },
            ]}
          />
          <Checkbox>Email me with news and offers</Checkbox>
          <Checkbox defaultChecked>Checked state</Checkbox>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="heading-2">Badges and chips</h2>
        <div className={styles.row}>
          <Badge>New</Badge>
          <Badge>Best seller</Badge>
          <Badge>Limited</Badge>
          <Badge tone="sale">Sale</Badge>
          <Badge tone="pending">Pending</Badge>
        </div>
        <div className={styles.row}>
          <Chip>Nutty</Chip>
          <Chip>Umami</Chip>
          <Chip tone="outline">Origin · Yame, Fukuoka</Chip>
        </div>
        <div className={[styles.row, styles.brandBlock].join(" ")}>
          <Chip tone="noteOnSoft">Mellow</Chip>
          <Chip tone="noteOnSoft">Umami</Chip>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="heading-2">Imagery</h2>
        <div className={styles.grid}>
          <ImagePlaceholder label="Tin pack shot" ratio="4:5" badge={<Badge>New</Badge>} />
          <ImagePlaceholder label="Character art · pending artist" shape="arch" showRatio={false} />
          <ImagePlaceholder label="Guide photo" ratio="3:2" />
          <ImagePlaceholder label="60-second video" ratio="16:9" />
          <ImagePlaceholder label="Lifestyle tile" ratio="1:1" tone="brand" />
          <ImagePlaceholder label="Tea in preparation" ratio="4:5" tone="dashed" showRatio={false} />
          <ArchFrame outlined>
            <ImagePlaceholder label="Tin + character · pending artist" tone="page" showRatio={false} style={{ height: "100%" }} />
          </ArchFrame>
        </div>
        <div className={styles.grid}>
          <div className={styles.stack}>
            <Skeleton ratio="4:5" />
            <Skeleton width="60%" />
            <Skeleton width="80%" height={30} />
            <Skeleton width="40%" />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="heading-2">Navigation</h2>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Shop Matcha", href: "/collections/matcha" }, { label: "Yame no Mukashi" }]} />
      </section>

      <section className={styles.section}>
        <h2 className="heading-2">Accordion</h2>
        <Accordion
          defaultOpen={["lattes"]}
          items={[
            { id: "lattes", title: "Is it good for lattes?", content: "Yes. The deep tea holds its flavour through milk; the bright tea is lighter and lovely over ice." },
            { id: "store", title: "How do I store it?", content: "Keep the tin closed tight, somewhere cool and dry, away from sunlight." },
            { id: "gift", title: "Can I send it as a gift?", content: "Yes. Tick “This is a gift” in your cart and add a note of up to 150 characters." },
          ]}
        />
      </section>

      <section className={styles.section}>
        <h2 className="heading-2">Tabs</h2>
        <Tabs
          label="Preparation method"
          items={[
            { id: "whisk", label: "Whisk", panel: <p>Sift 2 g into a warm bowl, paste with 80°C water, whisk in an M shape.</p> },
            { id: "frother", label: "Frother", panel: <p>Froth 2 g with 30 ml of 80°C water, then pour over 180 ml warm milk.</p> },
            { id: "shaker", label: "Shaker", panel: <p>Shake 2 g with 60 ml cold water for 20 seconds; pour over ice and milk.</p> },
            { id: "iced", label: "Iced latte", panel: <p>Pour the matcha slowly over ice and cold milk for the layers.</p> },
          ]}
        />
      </section>

      <DevDemos />
      <section className={styles.section}>
        <h2 className="heading-2">TasteScale</h2>
        <p className={styles.caption}>mini · panel (filled + outline comparison) · header (links + captions)</p>
        <div style={{ maxWidth: 280 }}>
          <TasteScale size="mini" markers={[{ position: 4, label: "Deep, 4 of 5" }]} />
        </div>
        <div style={{ maxWidth: 420 }}>
          <TasteScale size="panel" caption="Deep, 4 of 5" markers={[{ position: 4, label: "This tea, Deep 4 of 5" }, { position: 2, label: "Other tea, Bright 2 of 5", tone: "outline" }]} />
        </div>
        <div style={{ maxWidth: 640 }}>
          <TasteScale
            size="header"
            markers={[
              { position: 2, label: "[Daily tea name], Bright 2 of 5", caption: "[Daily] · 2 of 5", href: "/products/daily" },
              { position: 4, label: "Yame no Mukashi, Deep 4 of 5", caption: "Yame · 4 of 5", href: "/products/yame" },
            ]}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="heading-2">PriceBlock</h2>
        <div className={styles.row}>
          <PriceBlock price={money(4800, "AUD", true)} />
          <PriceBlock price={money(4800, "AUD", true)} from />
          <PriceBlock price={money(4000)} compareAt={money(4800)} />
          <PriceBlock price={money(4800)} perCup={money(320)} perCupNote="([2] g serve)" size="pdp" />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="heading-2">ProductCard</h2>
        <p className={styles.caption}>multi-size · single-size · sold out · sale · gift · in preparation</p>
        <div className={styles.cards}>
          <ProductCard product={PRODUCTS[0]!} />
          <ProductCard product={PRODUCTS[1]!} />
          <ProductCard product={{ ...PRODUCTS[1]!, availableForSale: false, variants: PRODUCTS[1]!.variants.map((v) => ({ ...v, availableForSale: false })) }} />
          <ProductCard
            product={{
              ...PRODUCTS[1]!,
              badges: ["sale"],
              variants: PRODUCTS[1]!.variants.map((v) => ({ ...v, price: money(2800, "AUD", true), compareAtPrice: money(3200, "AUD", true) })),
            }}
          />
          <ProductCard product={PRODUCTS[2]!} />
          <InPreparationCard />
        </div>
      </section>
    </main>
  );
}
