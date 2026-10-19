"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Tabs } from "@/components/ui/Disclosure";
import type { PrepMethod } from "@/lib/data/types";
import styles from "./PrepMethodTabs.module.css";

/** Whisk · Frother · Shaker · Iced latte: measurements, numbered steps and a 60-second video slot. */
export function PrepMethodTabs({ methods, troubleshootHref }: { methods: PrepMethod[]; troubleshootHref: string | null }) {
  return (
    <Tabs
      label="Preparation methods"
      items={methods.map((m) => ({
        id: m.id,
        label: m.name,
        panel: (
          <div className={styles.grid}>
            <div className={styles.recipe}>
              <dl className={styles.facts}>
                <div>
                  <Icon name="scale" size={22} />
                  <dt>Matcha</dt>
                  <dd>{m.grams}</dd>
                </div>
                <div>
                  <Icon name="thermometer" size={22} />
                  <dt>Water</dt>
                  <dd>{m.water}</dd>
                </div>
                <div>
                  <Icon name="cup" size={22} />
                  <dt>Milk</dt>
                  <dd>{m.milk}</dd>
                </div>
                <div>
                  <Icon name="clock" size={22} />
                  <dt>Time</dt>
                  <dd>{m.time}</dd>
                </div>
              </dl>
              <ol className={styles.steps}>
                {m.steps.map((s, i) => (
                  <li key={i}>
                    <span className={styles.n}>{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
              {troubleshootHref ? (
                <Link href={troubleshootHref} className="text-link">
                  Clumps, bitterness or dull colour? Here’s the gentle fix.
                </Link>
              ) : null}
            </div>
            <div className={styles.video} style={{ backgroundImage: `url('${m.poster.url}')` }} role="img" aria-label={`${m.name}: 60-second video, coming soon`}>
              <span className={styles.play}>
                <Icon name="play" size={26} />
              </span>
              <span className={styles.videoLabel}>60-second video · {m.name}</span>
            </div>
          </div>
        ),
      }))}
    />
  );
}
