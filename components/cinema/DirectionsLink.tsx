import { Button } from "@/components/ui/Button";
import { directionsLink } from "@/lib/cinema-content";
import styles from "./cinema.module.css";

/**
 * The verified route to the venue.
 *
 * Kept as its own component because the wording matters as much as the link: a
 * map search for the mall address is not the same thing as a pinned cinema
 * entrance, and the note underneath says so rather than letting a visitor
 * assume the pin is exact.
 *
 * Renders nothing when no verified destination has been supplied — an
 * unverified link would be worse than no link.
 */
export function DirectionsLink({
  size = "small",
  showNote = true,
}: {
  size?: "small" | "medium" | "large";
  showNote?: boolean;
}) {
  const directions = directionsLink();
  if (!directions) return null;

  return (
    <div>
      <Button href={directions.href} external variant="red" size={size}>
        {directions.label}
      </Button>
      {showNote ? (
        <p className={styles.pendingNote} style={{ marginTop: "0.5rem" }}>
          Opens Google Maps with a search for the mall address. It is not a pinned cinema entrance —
          check the entrance note below before travelling.
        </p>
      ) : null}
    </div>
  );
}
