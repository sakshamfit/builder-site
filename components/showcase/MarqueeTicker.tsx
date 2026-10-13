import type { CSSProperties } from "react";
import styles from "./marquee.module.css";

/**
 * Cinema marquee ticker.
 *
 * Carries only true, useful information — the venue, its locality, the date and
 * how many screenings are listed. It is deliberately not a marketing strip: a
 * scrolling board that invents "BOOK NOW" urgency would be the kind of claim
 * this project avoids.
 *
 * Accessibility: the whole strip is presentational. The items are duplicated to
 * make the CSS loop seamless, so the copy is exposed exactly once via a single
 * visually hidden sentence and everything visual is hidden from assistive tech.
 * The animation is pure CSS and is stopped outright by
 * `prefers-reduced-motion: reduce`.
 */
export function MarqueeTicker({ items, label }: { items: string[]; label: string }) {
  if (items.length === 0) return null;

  const group = (key: string, hidden: boolean) => (
    <div className={styles.group} key={key} aria-hidden={hidden ? "true" : undefined}>
      {items.map((item) => (
        <span className={styles.item} key={`${key}-${item}`}>
          {item}
        </span>
      ))}
    </div>
  );

  /*
   * A fixed seconds-per-item pace, so the strip travels at the same readable
   * speed whether it carries four facts or twelve. Without this the duration
   * would be constant and a long strip would race.
   */
  const pace: CSSProperties = {
    ["--marquee-duration" as string]: `${(items.length * 7).toFixed(0)}s`,
  };

  return (
    <div className={styles.marquee} style={pace}>
      <p className="visually-hidden">{label}</p>
      <div className={styles.track} aria-hidden="true">
        {group("a", true)}
        {group("b", true)}
      </div>
    </div>
  );
}
