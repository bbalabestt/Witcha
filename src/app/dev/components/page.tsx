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
import { DevDemos } from "./DevDemos";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Component sheet", robots: { index: false, follow: false } };

const SWATCHES = ["brand-mint", "brand-cream", "brand-gold", "brand-charcoal", "brand-charcoal-soft", "line-hairline", "feedback-error", "tea-matcha", "tea-hojicha"] as const;

const TYPE_STYLES: Array<[string, string]> = [
  ["display-xl", "Matcha, With Taste."],
  ["heading-1", "The Professor — Yame Matcha"],
  ["heading-2", "Taste comes first."],
  ["heading-3", "How to make it at home"],
  ["body", "Two grams, a splash of hot water, a quick froth."],
  ["body-small", "Okumidori · First harvest · 30 g"],
  ["label", "Matcha"],
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
        <p className="body">Every primitive and state, for checking states.</p>
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
          <Button>Shop the teas</Button>
          <Button size="lg">Add to cart</Button>
          <Button size="md">Sign me up</Button>
          <Button size="sm">Add</Button>
          <Button disabled>Disabled</Button>
          <Button status="loading">Adding…</Button>
          <Button status="success">Added</Button>
        </div>
        <div className={styles.row}>
          <Button variant="secondary">Find your tea</Button>
          <Button variant="secondary" size="md">See the recipes</Button>
                    <Button variant="link">How we chose them</Button>
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
          <Chip tone="outline">Yame, Fukuoka</Chip>
        </div>
        <div className={[styles.row, styles.brandBlock].join(" ")}>
          <Chip tone="noteOnSoft">Mellow</Chip>
          <Chip tone="noteOnSoft">Umami</Chip>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="heading-2">Imagery</h2>
        <div className={styles.grid}>
          <ImagePlaceholder ratio="4:5" />
          <ImagePlaceholder shape="arch" />
          <ImagePlaceholder ratio="3:2" />
          <ImagePlaceholder ratio="1:1" tone="brand" />
          <ArchFrame outlined>
            <ImagePlaceholder tone="page" style={{ height: "100%" }} />
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
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Teas", href: "/collections/teas" }, { label: "The Professor — Yame Matcha" }]} />
      </section>

      <section className={styles.section}>
        <h2 className="heading-2">Accordion</h2>
        <Accordion
          items={[
            { id: "one", title: "Is hojicha the same as matcha?", content: "No. Matcha and hojicha are different Japanese teas." },
            { id: "two", title: "Do your teas contain caffeine?", content: "Yes. Our matcha and hojicha all contain caffeine." },
          ]}
        />
      </section>

      <section className={styles.section}>
        <h2 className="heading-2">Tabs</h2>
        <Tabs
          label="Preparation method"
          items={[
            { id: "whisk", label: "Whisk", panel: <p>Whisk briskly in an &quot;M&quot; motion, not circles.</p> },
            { id: "frother", label: "Frother", panel: <p>Same flavour, a foamier texture.</p> },
          ]}
        />
      </section>

      <DevDemos />
    </main>
  );
}
