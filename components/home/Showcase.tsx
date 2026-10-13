import { VenueSpotlight } from "@/components/showcase/VenueSpotlight";
import { VenuePhotographyPending } from "@/components/showcase/VenuePhotographyPending";
import { ShowcaseHighlights } from "@/components/showcase/ShowcaseHighlights";
import { Button } from "@/components/ui/Button";
import { showcaseCopy, showcaseHighlights, showcaseImages } from "@/data/showcase";
import styles from "./home.module.css";

/**
 * The cinema-hall showcase — the centrepiece of the home page.
 *
 * A venue site's job is to show people the place before they commit to coming.
 * This section therefore sits directly under the hero, ahead of anything to do
 * with tickets.
 *
 * It renders approved venue photography when there is any, and an explicit
 * photography-requested panel when there is not. Both are real states; there is
 * no third state in which a picture of a different cinema stands in for this one.
 */
export function Showcase() {
  const venuePhotographs = showcaseImages.filter((image) => image.depictsVenue);

  return (
    <section className={styles.showcaseSection} id="showcase" aria-labelledby="showcase-title">
      <div className="wrap reveal">
        <div className="section-head">
          <div>
            <span className="eyebrow">{showcaseCopy.eyebrow}</span>
            <h2 id="showcase-title">{showcaseCopy.heading}</h2>
            <p>{showcaseCopy.lede}</p>
          </div>
          <Button href="/cinema" variant="outline" size="small">
            Full venue details
          </Button>
        </div>

        {venuePhotographs.length > 0 ? (
          <VenueSpotlight images={venuePhotographs} />
        ) : (
          <VenuePhotographyPending />
        )}

        <ShowcaseHighlights highlights={showcaseHighlights} />

        {venuePhotographs.length > 0 ? (
          <p className={styles.showcaseNote}>{showcaseCopy.galleryNote}</p>
        ) : null}
      </div>
    </section>
  );
}
