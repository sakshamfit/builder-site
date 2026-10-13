import { Button } from "@/components/ui/Button";
import { DirectionsLink } from "@/components/cinema/DirectionsLink";
import { venue } from "@/data/cinema";
import { confirmed, confirmedAddressLines, isPending, pendingNote } from "@/lib/cinema-content";
import styles from "./home.module.css";

/**
 * "Visit Elante Mall" panel.
 *
 * Shows the confirmed address and a verified directions link, and states
 * plainly which details are still outstanding rather than padding the panel
 * with invented amenities. Full access information lives on /cinema.
 */
export function VenueInfo() {
  const addressLines = confirmedAddressLines();
  const phone = confirmed(venue.contact.phone);
  const planningNote = venue.address.planningNote;

  return (
    <section className={`section ${styles.sectionAlt}`} aria-labelledby="visit-title">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Getting here</span>
            <h2 id="visit-title">Visit the cinema</h2>
            <p>
              The cinema is inside Elante Mall on Purv Marg, Chandigarh. Confirm your entrance and
              parking before you set off — see the notes below.
            </p>
          </div>
          <Button href="/cinema" variant="secondary" size="small">
            Access and directions
          </Button>
        </div>

        <div className={styles.visitGrid}>
          <div className={`surface ${styles.visitPanel}`}>
            <h3 className="visually-hidden">Address</h3>
            {addressLines.length > 0 ? (
              <address className={styles.visitAddress} style={{ fontStyle: "normal" }}>
                {addressLines.map((line) => (
                  <span key={line} style={{ display: "block" }}>
                    {line}
                  </span>
                ))}
              </address>
            ) : (
              <p className={styles.visitPending}>The address has not been confirmed yet.</p>
            )}

            <DirectionsLink size="small" />
          </div>

          <dl className={`surface ${styles.visitPanel}`}>
            <div className={styles.visitList}>
              <dt className={styles.visitListTerm}>Parking and transit</dt>
              <dd className={styles.visitPending}>
                {isPending(venue.arrival.parking)
                  ? venue.arrival.parking.pendingNote
                  : venue.arrival.parking.value}
              </dd>
            </div>

            <div className={styles.visitList}>
              <dt className={styles.visitListTerm}>Entrances</dt>
              <dd className={styles.visitPending}>{pendingNote(planningNote)}</dd>
            </div>

            <div className={styles.visitList}>
              <dt className={styles.visitListTerm}>Phone</dt>
              <dd className={styles.visitPending}>
                {phone ? <a href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a> : pendingNote(venue.contact.phone)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
