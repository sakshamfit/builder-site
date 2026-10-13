import { Badge } from "@/components/ui/Badge";
import type { ShowcaseHighlight } from "@/data/showcase";
import styles from "./showcase.module.css";

/**
 * "What this cinema offers", stated as facts where they are facts and as open
 * questions where they are not.
 *
 * A visitor deciding whether to travel cares about seating, access and sound
 * far more than marketing copy, so every line here is either confirmed or
 * explicitly outstanding. Nothing is described in general terms to imply more
 * than the venue has told us.
 */
export function ShowcaseHighlights({ highlights }: { highlights: ShowcaseHighlight[] }) {
  return (
    <ul className={styles.highlights}>
      {highlights.map((highlight) => (
        <li
          key={highlight.id}
          className={[
            styles.highlight,
            highlight.status === "confirmed" ? styles.highlightConfirmed : styles.highlightPending,
          ].join(" ")}
        >
          <p className={styles.highlightLabel}>{highlight.label}</p>
          <p className={styles.highlightDetail}>{highlight.detail}</p>
          <p>
            {highlight.status === "confirmed" ? (
              <Badge tone="ok">Confirmed by the venue</Badge>
            ) : (
              <Badge tone="amber">Awaiting venue</Badge>
            )}
          </p>
        </li>
      ))}
    </ul>
  );
}
