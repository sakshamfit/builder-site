import { Button } from "@/components/ui/Button";
import { DirectionsLink } from "@/components/cinema/DirectionsLink";
import { venue } from "@/data/cinema";
import { confirmedAddressLines, pendingNote } from "@/lib/cinema-content";
import styles from "./cinema.module.css";

/**
 * Where the cinema is, and how to get there.
 *
 * No embedded map and no coordinates. An interactive map needs a key the owner
 * has not supplied, and — more importantly — a pin would assert an exact
 * entrance this project has not verified. A verified destination link plus a
 * written note is the honest option.
 */
export function LocationPanel() {
  const addressLines = confirmedAddressLines();

  return (
    <section className={`surface ${styles.panel}`} aria-labelledby="location-title">
      <h2 className={styles.panelTitle} id="location-title">
        Find the cinema
      </h2>

      {addressLines.length > 0 ? (
        <address className={styles.address} style={{ fontStyle: "normal" }}>
          {addressLines.map((line) => (
            <span key={line} style={{ display: "block" }}>
              {line}
            </span>
          ))}
        </address>
      ) : (
        <p className={styles.pendingValue}>The venue address has not been confirmed.</p>
      )}

      <div className={styles.actions}>
        <DirectionsLink size="small" showNote={false} />
        <Button href="/help" variant="secondary" size="small">
          Booking help
        </Button>
      </div>

      <div className={styles.mapFallback}>
        <p>
          <strong>About this location.</strong> The link above is a map search for the mall address.
          We have not published a precise pin because the cinema&rsquo;s own entrance has not been
          confirmed.
        </p>
        <p>{pendingNote(venue.address.planningNote)}</p>
      </div>
    </section>
  );
}
