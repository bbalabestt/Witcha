"use client";

import { useState, type ReactNode } from "react";
import styles from "./DrawingGallery.module.css";

/** Gallery shape, ready for real photography. Until then each slide is a line drawing, with no caption. */
export function DrawingGallery({ slides }: { slides: ReactNode[] }) {
  const [index, setIndex] = useState(0);
  return (
    <div className={styles.gallery} data-loop="">
      <div className={styles.main} aria-hidden="true">
        {slides[index]}
      </div>
      {slides.length > 1 ? (
        <div className={styles.thumbs}>
          {slides.map((slide, i) => (
            <button key={i} type="button" className={styles.thumb} aria-label={`Show image ${i + 1}`} aria-current={i === index || undefined} onClick={() => setIndex(i)}>
              {slide}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
