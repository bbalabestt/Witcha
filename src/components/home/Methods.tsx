"use client";

import Link from "next/link";
import { useState } from "react";
import { hoverCapable } from "@/components/motion/runtime";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { MethodId } from "@/lib/data/types";
import styles from "./Methods.module.css";

export type MethodCard = { id: MethodId; name: string; summary: string; photo: string; href: string };

const ICON: Record<MethodId, IconName> = { whisk: "whisk", frother: "frother", shaker: "shaker", iced: "iced" };
const STARS: Array<[number, number, number]> = [[4, 10, 12], [30, 6, 8], [70, 8, 10], [94, 20, 12], [88, 88, 9], [8, 90, 8]];

/**
 * "A little magic, made at home": four method cards that flip in 3D on hover or keyboard focus (0.9 s, slight
 * overshoot). The back is an arch-topped photo that zooms out. No flip on touch; a cross-fade under reduced motion.
 */
export function Methods({ methods }: { methods: MethodCard[] }) {
  const [flip, setFlip] = useState<MethodId | null>(null);
  return (
    <section className={styles.section} data-cat-line="Whisk, whisk, whisk!" aria-labelledby="wm-methods-title">
      {STARS.map(([l, t, s], i) => (
        <span key={i} data-twinkle="" aria-hidden="true" className="twinkle" style={{ left: `${l}%`, top: `${t}%`, width: s, height: s }} />
      ))}
      <div className={`container ${styles.inner}`}>
        <div className={styles.head}>
          <h2 id="wm-methods-title" className="display-section" data-reveal="wipe-l">
            A little magic, <i className="serif-italic">made at home</i>
          </h2>
          <Link href="/blogs/brewing-guides" className="label-link" data-reveal="right">
            All brewing guides
          </Link>
        </div>
        <div className={styles.grid}>
          {methods.map((m, i) => (
            <div key={m.id} className={styles.slot} data-reveal={i < 2 ? "left" : "right"} data-delay={String([0, 120, 120, 0][i] ?? 0)}>
              <Link
                href={m.href}
                className={styles.card}
                data-flipped={flip === m.id || undefined}
                aria-label={`${m.name}: read the guide`}
                onMouseEnter={() => hoverCapable() && setFlip(m.id)}
                onMouseLeave={() => setFlip((f) => (f === m.id ? null : f))}
                onFocus={() => setFlip(m.id)}
                onBlur={() => setFlip((f) => (f === m.id ? null : f))}
              >
                <span className={styles.front}>
                  <span className={styles.n}>{String(i + 1).padStart(2, "0")}</span>
                  <Icon name={ICON[m.id]} size={36} />
                  <span className={styles.name}>{m.name}</span>
                  <span className={`body-small ${styles.meas}`}>{m.summary}</span>
                </span>
                <span className={styles.back} aria-hidden="true">
                  <span className={styles.photoArch}>
                    <span className={styles.photo} style={{ backgroundImage: `url('${m.photo}')` }} />
                    <span className={styles.pop}>
                      <Icon name={ICON[m.id]} size={32} />
                    </span>
                  </span>
                  <span className={styles.backFoot}>
                    <span>{m.name}</span>
                    <span>Read the guide →</span>
                  </span>
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
