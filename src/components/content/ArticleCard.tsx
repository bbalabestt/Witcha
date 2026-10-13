import Link from "next/link";
import { MediaFrame } from "@/components/ui/MediaThumb";
import type { Article } from "@/lib/data/types";
import styles from "./Content.module.css";

export function ArticleCard({ article, headingLevel: H = "h2", showTime = true }: { article: Article; headingLevel?: "h2" | "h3"; showTime?: boolean }) {
  return (
    <article className={styles.articleCard}>
      <MediaFrame media={article.image} ratio="3:2" sizes="(max-width: 700px) 100vw, 33vw" fallbackLabel="Guide photo" />
      <span className="label">
        {article.method}
        {showTime && article.time ? ` · ${article.time}` : ""}
      </span>
      <H className={styles.cardTitle}>
        <Link href={`/blogs/${article.blogHandle}/${article.handle}`} className={styles.cardLink}>
          {article.title}
        </Link>
      </H>
    </article>
  );
}
