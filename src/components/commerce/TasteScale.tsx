import Link from "next/link";
import { markerLeft } from "@/lib/data/product";
import styles from "./TasteScale.module.css";

const TICKS = [0, 25, 50, 75, 100];

function Ticks({ size }: { size: "mini" | "full" | "lineup" }) {
  return (
    <>
      {TICKS.map((t) => (
        <span key={t} className={`${styles.tick} ${styles[`tick_${size}`]}`} style={{ left: t === 100 ? undefined : `${t}%`, right: t === 100 ? 0 : undefined }} />
      ))}
    </>
  );
}

/** Card variant: "BRIGHT · track · DEEP" on one line. Reads without colour through its label. */
export function TasteMini({ position, label }: { position: number; label: string }) {
  return (
    <div className={styles.mini} role="img" aria-label={label}>
      <span className={styles.end}>Bright</span>
      <div className={`${styles.track} ${styles.trackMini}`}>
        <Ticks size="mini" />
        <span className={`${styles.marker} ${styles.markerMini}`} style={{ left: markerLeft(position, 11) }} />
      </div>
      <span className={styles.end}>Deep</span>
    </div>
  );
}

/** PDP variant: filled arch at this tea, outline arches at the others; "Deep, 4 of 5" as text. */
export function TasteScaleFull({ position, text, others = [] }: { position: number; text: string; others?: number[] }) {
  return (
    <div className={styles.full}>
      <div className={styles.fullHead}>
        <span className="label">Taste</span>
        <span className={styles.fullText}>{text}</span>
      </div>
      <div className={`${styles.track} ${styles.trackFull}`} aria-hidden="true">
        <Ticks size="full" />
        {others
          .filter((o) => o !== position)
          .map((o) => (
            <span key={o} className={`${styles.marker} ${styles.markerFull} ${styles.markerOutline}`} style={{ left: markerLeft(o, 17) }} />
          ))}
        <span className={`${styles.marker} ${styles.markerFull}`} style={{ left: markerLeft(position, 17) }} />
      </div>
      <div className={styles.ends}>
        <span className="label">Bright</span>
        <span className="label">Deep</span>
      </div>
    </div>
  );
}

export type LineupTea = { handle: string; title: string; position: number; word: string };

/** Collection header: every tea placed on one scale; teas sharing a stop share a marker. */
export function TasteLineup({ teas }: { teas: LineupTea[] }) {
  const stops = new Map<number, LineupTea[]>();
  for (const t of teas) stops.set(t.position, [...(stops.get(t.position) ?? []), t]);
  const groups = [...stops.entries()].sort((a, b) => a[0] - b[0]);
  // Labels of neighbouring stops alternate rows so they never overlap.
  const rows: number[] = [];
  groups.forEach(([pos], i) => rows.push(i > 0 && pos - groups[i - 1]![0] < 2 && rows[i - 1] === 1 ? 2 : 1));
  return (
    <div className={styles.lineup}>
      <div className={styles.ends}>
        <span className="label">Bright</span>
        <span className="label">Deep</span>
      </div>
      <div className={`${styles.track} ${styles.trackLineup}`}>
        <Ticks size="lineup" />
        {groups.map(([pos, group]) => (
          <Link
            key={pos}
            href={`/products/${group[0]!.handle}`}
            className={`${styles.marker} ${styles.markerLineup}`}
            style={{ left: markerLeft(pos, 27) }}
            aria-label={`${group.map((g) => g.title).join(" and ")}, ${group[0]!.word} ${pos} of 5`}
          />
        ))}
      </div>
      <div className={styles.lineupLabels} aria-hidden="true">
        {groups.map(([pos, group], i) => (
          <span
            key={pos}
            style={{ left: `${(pos - 1) * 25}%` }}
            data-edge={pos === 5 ? "end" : pos === 1 ? "start" : undefined}
            data-row={rows[i] === 2 ? "2" : undefined}
          >
            {group.map((g) => g.title).join(" · ")} · {pos} of 5
          </span>
        ))}
      </div>
    </div>
  );
}
