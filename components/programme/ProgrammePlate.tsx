import styles from "./programme.module.css";

/**
 * The plate that stands in for film artwork.
 *
 * Most films in the sourced programme have no licensed artwork — the venue has
 * not supplied any and this project does not download posters. Rather than leave
 * a hole in the grid, or dress the tile up as something it is not, each film gets
 * a typographic plate: the title set in the display face over one of a few
 * flat-colour treatments, chosen deterministically from the slug so a grid is
 * varied without ever being random between renders.
 *
 * This is deliberately NOT a poster. It carries no imagery, no studio mark and no
 * title treatment, and it says on its face that artwork is pending. A visitor
 * cannot mistake it for key art, and a rights holder has nothing to object to.
 */
export function ProgrammePlate({
  title,
  slug,
  releaseDateLabel,
  compact = false,
}: {
  title: string;
  /** Stable input for the colour choice, so the plate never changes on re-render. */
  slug: string;
  /** "In cinemas from 16 Oct" or similar. Rendered very small under the title. */
  releaseDateLabel?: string | null;
  compact?: boolean;
}) {
  const variant = hash(slug) % 4;
  const tone = ["red", "ink", "gold", "paper"][variant] as "red" | "ink" | "gold" | "paper";

  return (
    <div className={`${styles.plate} ${styles[tone]} ${compact ? styles.plateCompact : ""}`}>
      <span className={styles.plateRule} aria-hidden="true" />
      <span className={styles.plateKicker}>Artwork pending</span>
      <span className={styles.plateTitle} aria-hidden="true">
        {title}
      </span>
      {releaseDateLabel ? <span className={styles.plateDate}>{releaseDateLabel}</span> : null}
    </div>
  );
}

/** Small stable hash. Only used to pick a colour; collisions are fine. */
function hash(value: string): number {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) >>> 0;
  }
  return result;
}
