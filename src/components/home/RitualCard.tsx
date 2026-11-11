"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RECIPES } from "@/lib/content/recipes";
import { RITUAL_EVENT, type RitualStep } from "./MatchaBowl";
import styles from "./RitualCard.module.css";

const USUCHA = RECIPES.find((r) => r.id === "usucha");

/**
 * The usucha recipe (copy v5.3 §4) beside the hero bowl. The step the bowl is showing lights up as it plays:
 * sift, pour, whisk; whisking it yourself lights the whisk step again. Every step stays readable throughout;
 * only the emphasis moves. Desktop only: phones already show the bowl full width.
 */
export function RitualCard() {
  const [step, setStep] = useState<RitualStep | null>(null);

  useEffect(() => {
    const on = (e: Event) => setStep((e as CustomEvent<RitualStep>).detail);
    window.addEventListener(RITUAL_EVENT, on);
    return () => window.removeEventListener(RITUAL_EVENT, on);
  }, []);

  if (!USUCHA) return null;
  const best = USUCHA.bestWith[0];

  return (
    <section className={styles.card} aria-label={USUCHA.name}>
      <span className="label">{USUCHA.name}</span>
      <p className={styles.needs}>{USUCHA.needs.join(" · ")}</p>
      <ol className={styles.steps}>
        {USUCHA.steps.map((s, i) => (
          <li key={s} data-state={step === null || step === 3 ? "done" : i < step ? "done" : i === step ? "now" : "next"}>
            <span className={styles.n} aria-hidden="true">
              {i + 1}
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
      {best ? (
        <p className={styles.best}>
          Best with{" "}
          <Link href={`/products/${best.handle}`} className="text-link">
            {best.label}
          </Link>
        </p>
      ) : null}
    </section>
  );
}
