import type { Metadata } from "next";
import { LocationPanel } from "@/components/cinema/LocationPanel";
import { VenueSpecSheet } from "@/components/cinema/VenueSpecSheet";
import { VenueGallery } from "@/components/showcase/VenueGallery";
import { VenuePhotographyPending } from "@/components/showcase/VenuePhotographyPending";
import { showcaseCopy, showcaseImages } from "@/data/showcase";
import { Facilities, ScreenLegend } from "@/components/cinema/Facilities";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { pendingFacts, venue } from "@/data/cinema";
import { confirmed, directionsLink, pendingNote } from "@/lib/cinema-content";
import { buildMetadata } from "@/lib/metadata";
import styles from "@/components/cinema/cinema.module.css";

export const metadata: Metadata = buildMetadata({
  title: "The cinema at Elante Mall",
  description:
    "Location, directions, access and facilities for the cinema at Elante Mall, Chandigarh, including which details are still being confirmed with the venue.",
  path: "/cinema",
});

/**
 * Venue page.
 *
 * The rule for this page is simple: state what the venue has confirmed, and
 * label everything else as outstanding. Accessibility in particular is never
 * asserted on the venue's behalf, because a wrong answer here has real
 * consequences for someone's journey.
 */
export default function CinemaPage() {
  const phone = confirmed(venue.contact.phone);
  const email = confirmed(venue.contact.email);
  const directions = directionsLink();
  const outstanding = pendingFacts();
  const venuePhotographs = showcaseImages.filter((image) => image.depictsVenue);

  return (
    <div className="wrap scene-pad reveal">
      <div className="section-head">
        <div>
          <span className="eyebrow">The venue</span>
          <h1>The cinema at Elante Mall</h1>
          <p>
            Everything below is either confirmed by the venue or labelled as still being checked.
            Nothing here is estimated.
          </p>
        </div>
        {directions ? (
          <Button href={directions.href} external variant="red" size="small">
            Get directions
          </Button>
        ) : null}
      </div>

      <section style={{ marginBottom: "2rem" }} aria-labelledby="venue-gallery-title">
        <div className="section-head">
          <div>
            <span className="eyebrow">{showcaseCopy.eyebrow}</span>
            <h2 id="venue-gallery-title">Inside the hall</h2>
            <p>{showcaseCopy.lede}</p>
          </div>
        </div>
        {/*
          Approved venue photography renders here the moment it exists. Until
          then the page states that it is pending — the illustrations that used
          to stand in for it were removed, because a picture of a generic
          auditorium on this cinema's own venue page reads as a photograph of
          this cinema.
        */}
        {venuePhotographs.length > 0 ? (
          <VenueGallery images={venuePhotographs} note={showcaseCopy.galleryNote} />
        ) : (
          <VenuePhotographyPending />
        )}
      </section>

      <div className={styles.layout}>
        <VenueSpecSheet
          footnote="Every row below is generated from the venue record in data/cinema.ts. A row fills in automatically when the cinema confirms that fact — nothing on this page is estimated from a neighbouring detail."
        />

        <LocationPanel />

        <section className={`box ${styles.panel}`} aria-labelledby="hours-title">
          <h2 className={styles.panelTitle} id="hours-title">
            Opening times
          </h2>
          <dl className={styles.definitionList}>
            {venue.hours.map((entry) => (
              <div className={styles.definition} key={entry.label}>
                <dt className={styles.definitionTerm}>{entry.label}</dt>
                <dd
                  className={
                    entry.value.status === "confirmed"
                      ? styles.definitionValue
                      : styles.pendingValue
                  }
                >
                  {entry.value.status === "confirmed"
                    ? entry.value.value
                    : pendingNote(entry.value)}
                </dd>
              </div>
            ))}
          </dl>
          <p className={styles.pendingNote}>
            Screening times on this site are the reliable source for what is playing today — box
            office opening hours are a separate thing and are listed above once confirmed.
          </p>
        </section>

        <Facilities />

        <ScreenLegend />

        <section className={`box ${styles.panel}`} aria-labelledby="contact-title">
          <h2 className={styles.panelTitle} id="contact-title">
            Contact
          </h2>
          <dl className={styles.definitionList}>
            <div className={styles.definition}>
              <dt className={styles.definitionTerm}>Phone</dt>
              <dd className={phone ? styles.definitionValue : styles.pendingValue}>
                {phone ? (
                  <a href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a>
                ) : (
                  pendingNote(venue.contact.phone)
                )}
              </dd>
            </div>
            <div className={styles.definition}>
              <dt className={styles.definitionTerm}>Email</dt>
              <dd className={email ? styles.definitionValue : styles.pendingValue}>
                {email ? (
                  <a href={`mailto:${email}`}>{email}</a>
                ) : (
                  pendingNote(venue.contact.email)
                )}
              </dd>
            </div>
          </dl>
          <p className={styles.pendingNote}>
            Lost property, refunds and group bookings are handled by the cinema; we will publish the
            right contact route for each as soon as it is confirmed.
          </p>
        </section>

        <section
          className={`box ${styles.panel} ${styles.layoutFull}`}
          aria-labelledby="outstanding-title"
        >
          <h2 className={styles.panelTitle} id="outstanding-title">
            Still being confirmed
          </h2>
          <p className={styles.pendingNote}>
            A venue site is only useful if it is trustworthy, so we publish the gaps rather than
            filling them in. These details are with the cinema for confirmation.
          </p>
          <div className={styles.pendingList}>
            {outstanding.map((item, index) => (
              <div className={styles.pendingItem} key={`${item.label}-${index}`}>
                <p className={styles.pendingLabel}>
                  {item.label} <Badge tone="amber">Awaiting venue</Badge>
                </p>
                {item.note ? <p className={styles.pendingNote}>{item.note}</p> : null}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
