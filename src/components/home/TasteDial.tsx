"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { TASTE_WORDS, type TastePosition } from "@/lib/data/types";
import styles from "./Home.module.css";

type TasteDialProps = {
  /** Shown for positions 1–2, 3 and 4–5 respectively (server-rendered cards). */
  bright: ReactNode;
  balanced: ReactNode;
  deep: ReactNode;
  initial?: TastePosition;
};

const clampPos = (n: number) => Math.min(5, Math.max(1, Math.round(n))) as TastePosition;

/** "How do you like it today?": a draggable arch marker on the 1–5 scale that swaps the suggestion. */
export function TasteDial({ bright, balanced, deep, initial = 4 }: TasteDialProps) {
  const [pos, setPos] = useState<TastePosition>(initial);
  const [x, setX] = useState((initial - 1) / 4);
  const [dragging, setDragging] = useState(false);
  const track = useRef<HTMLDivElement>(null);

  function fromPointer(e: PointerEvent<HTMLDivElement>) {
    const r = track.current?.getBoundingClientRect();
    if (!r) return;
    const nx = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    setX(nx);
    setPos(clampPos(nx * 4 + 1));
  }

  function choose(n: TastePosition) {
    setPos(n);
    setX((n - 1) / 4);
  }

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const map: Record<string, number> = { ArrowRight: pos + 1, ArrowUp: pos + 1, ArrowLeft: pos - 1, ArrowDown: pos - 1, Home: 1, End: 5 };
    const next = map[e.key];
    if (next === undefined) return;
    e.preventDefault();
    choose(clampPos(next));
  }

  const word = TASTE_WORDS[pos - 1];
  const suggestion = pos <= 2 ? bright : pos === 3 ? balanced : deep;

  return (
    <section className={styles.dialSection} aria-labelledby="dial-title">
      <div className={styles.dialControls}>
        <span className="label" data-reveal="left">
          The taste scale · drag anywhere along it
        </span>
        <h2 id="dial-title" className={styles.sectionDisplay} data-reveal="left">
          How do you like it today? <i aria-live="polite">{word}.</i>
        </h2>
        <div className={styles.dial} data-reveal="left">
          <div
            ref={track}
            className={styles.dialTrack}
            role="slider"
            tabIndex={0}
            aria-label="Taste, bright to deep"
            aria-valuemin={1}
            aria-valuemax={5}
            aria-valuenow={pos}
            aria-valuetext={`${word}, ${pos} of 5`}
            data-dragging={dragging || undefined}
            onKeyDown={onKey}
            onPointerDown={(e) => {
              setDragging(true);
              e.currentTarget.setPointerCapture(e.pointerId);
              fromPointer(e);
            }}
            onPointerMove={(e) => dragging && fromPointer(e)}
            onPointerUp={() => {
              setDragging(false);
              setX((pos - 1) / 4);
            }}
            onPointerCancel={() => setDragging(false)}
            style={{ "--x": x } as CSSProperties}
          >
            <span className={styles.dialLine} />
            <span className={styles.dialFill} />
            <span className={styles.dialMarker} aria-hidden="true">
              {pos}
            </span>
          </div>
          <div className={styles.dialStops}>
            {([1, 2, 3, 4, 5] as const).map((n) => (
              <button key={n} type="button" aria-pressed={n === pos} aria-label={`Taste ${n} of 5`} onClick={() => choose(n)}>
                {n}
              </button>
            ))}
          </div>
          <div className={styles.dialEnds} aria-hidden="true">
            <span>BRIGHT</span>
            <span>DEEP</span>
          </div>
        </div>
      </div>
      <div className={styles.dialResult}>{suggestion}</div>
    </section>
  );
}
