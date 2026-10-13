import { Button } from "@/components/ui/Button";
import { DirectionsLink } from "@/components/cinema/DirectionsLink";
import { VenueSpecSheet } from "@/components/cinema/VenueSpecSheet";
import { venue } from "@/data/cinema";
import { confirmed, confirmedAddressLines, pendingNote } from "@/lib/cinema-content";
import styles from "./home.module.css";

/**
 * "Visit the cinema" panel.
 *
 * The confirmed address and a verified directions link sit beside the venue
 * specification sheet, which states plainly which details are still outstanding
 * rather than padding the panel with invented amenities. Full access information
 * lives on /cinema.
 */
export function VenueInfo() {
  const addressLines = confirmedAddressLines();
  const phone = confirmed(venue.contact.phone);

  return (
    <section className={`scene-pad sectionAlt`} aria-labelledby="visit-title">
      <div className="wrap reveal">
        <div className="section-head">
          <div>
            <span className="eyebrow">Getting here</span>
            <h2 id="visit-title">Visit the cinema</h2>
            <p>
              The cinema is inside Elante Mall on Purv Marg, Chandigarh. Confirm your entrance and
              parking before you set off — see the notes below.
            </p>
          </div>
          <Button href="/cinema" variant="outline" size="small">
            Access and directions
          </Button>
        </div>

        <div className={styles.visitGrid}>
          <div className={`box ${styles.visitPanel}`}>
            <h3 className="visually-hidden">Address</h3>
            {addressLines.length > 0 ? (
              <address className={styles.visitAddress}>
                {addressLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </address>
            ) : (
              <p className={styles.visitPending}>The address has not been confirmed yet.</p>
            )}

            <DirectionsLink size="small" />

            <dl className={styles.visitList}>
              <div>
                <dt className={styles.visitListTerm}>Phone</dt>
                <dd className={styles.visitPending}>
                  {phone ? (
                    <a href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a>
                  ) : (
                    pendingNote(venue.contact.phone)
                  )}
                </dd>
              </div>
              <div>
                <dt className={styles.visitListTerm}>Parking and transit</dt>
                <dd className={styles.visitPending}>
                  {pendingNote(venue.arrival.parking, "Parking arrangements are awaiting confirmation.")}
                </dd>
              </div>
            </dl>
          </div>

          <VenueSpecSheet variant="summary" />
        </div>
      </div>
    </section>
  );
}
