import { showcaseCopy, showcaseHighlights } from "@/data/showcase";
import styles from "./showcase.module.css";

/**
 * The space a venue gallery will occupy, before the venue has supplied one.
 *
 * This is the honest alternative to decorative imagery: rather than showing a
 * different cinema's auditorium, it lists exactly what has been requested, what
 * will appear here, and the one thing the site can currently say for certain
 * about how films are presented here at all.
 *
 * It is designed rather than left blank — a ruled panel in the spec-sheet idiom
 * — because "we do not have this yet" is a real state that a real venue site has
 * to render well, not an error page.
 */
export function VenuePhotographyPending() {
  const outstanding = showcaseHighlights.filter((highlight) => highlight.status === "pending");
  const confirmed = showcaseHighlights.filter((highlight) => highlight.status === "confirmed");

  return (
    <div className={styles.pendingPanel}>
      <div className={styles.pendingHead}>
        <span className={styles.pendingKicker}>Images</span>
        <h3 className={styles.pendingTitle}>{showcaseCopy.pendingTitle}</h3>
        <p className={styles.pendingDetail}>{showcaseCopy.pendingDetail}</p>
      </div>

      <div className={styles.pendingGrid}>
        <div className={styles.pendingColumn}>
          <h4 className={styles.pendingColumnTitle}>Requested from the venue</h4>
          <ul className={styles.pendingList}>
            {outstanding.map((item) => (
              <li key={item.id}>
                <span className={styles.pendingItemLabel}>{item.label}</span>
                <span className={styles.pendingItemDetail}>{item.detail}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.pendingColumn}>
          <h4 className={styles.pendingColumnTitle}>What is known for certain</h4>
          <ul className={styles.pendingList}>
            {confirmed.map((item) => (
              <li key={item.id}>
                <span className={styles.pendingItemLabel}>{item.label}</span>
                <span className={styles.pendingItemDetail}>{item.detail}</span>
              </li>
            ))}
          </ul>
          <p className={styles.pendingFootnote}>
            Everything above is either confirmed by the venue or named as outstanding. Nothing on
            this site is estimated, and no facility is claimed on the venue&rsquo;s behalf.
          </p>
        </div>
      </div>
    </div>
  );
}
