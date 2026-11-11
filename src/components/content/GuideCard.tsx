import Image from "next/image";
import Link from "next/link";
import type { Guide } from "@/lib/data/types";
import styles from "@/app/(shop)/content.module.css";

export const METHOD_LABEL: Record<Guide["method"], string> = { whisk: "Whisk", frother: "Frother", shaker: "Shaker", iced: "Iced" };

/** 3:2 image, method · time label, serif title. */
export function GuideCard({ guide, showTime = true }: { guide: Guide; showTime?: boolean }) {
  return (
    <Link href={`/blogs/brewing-guides/${guide.handle}`} className={styles.guideCard}>
      <span className={styles.guideImage}>
        {guide.image ? <Image src={guide.image.url} alt="" fill sizes="(max-width: 699px) 92vw, 30vw" className={styles.cover} /> : null}
      </span>
      <span className="label">
        {METHOD_LABEL[guide.method]}
        {showTime ? ` · ${guide.time}` : ""}
      </span>
      <span className={styles.title3}>{guide.title}</span>
    </Link>
  );
}
