import { VenueSpotlight } from "@/components/showcase/VenueSpotlight";
import { ShowcaseHighlights } from "@/components/showcase/ShowcaseHighlights";
import { Button } from "@/components/ui/Button";
import { showcaseCopy, showcaseHighlights, showcaseImages } from "@/data/showcase";
import styles from "./home.module.css";

/**
 * The cinema-hall showcase — the centrepiece of the home page.
 *
 * A venue site's job is to show people the place before they commit to coming.
 * This section therefore sits directly under the hero, ahead of anything to do
 * with tickets, and every image states plainly that it is an illustration until
 * approved photography arrives.
 */
export function Showcase() {
  return (
    <section className={styles.showcaseSection} id="showcase" aria-labelledby="showcase-title">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">{showcaseCopy.eyebrow}</span>
            <h2 id="showcase-title">{showcaseCopy.heading}</h2>
            <p>{showcaseCopy.lede}</p>
          </div>
          <Button href="/cinema" variant="secondary" size="small">
            Full venue details
          </Button>
        </div>

        <VenueSpotlight images={showcaseImages} />
        <ShowcaseHighlights highlights={showcaseHighlights} />

        <p className={styles.showcaseNote}>{showcaseCopy.galleryNote}</p>
      </div>
    </section>
  );
}
