import { siteConfig } from "@/lib/site-config";
import { placeLabel } from "@/lib/cinema-content";
import styles from "./intro.module.css";

/**
 * The opening intro — the venue's name, set in type, for two and a half seconds.
 *
 * Adapted from the logo intro in the owner's `gireeshkumarreddy/pk` repository
 * (ASSET_CREDITS.md §11). Upstream reveals the film's title artwork; this
 * reveals the trade name exactly as the wordmark sets it — no logo is drawn,
 * because the venue has not supplied one.
 *
 * It is a server component with no state: the markup is always in the page and
 * always hidden, and the pre-paint script in `lib/cinematic.ts` is the only
 * thing that can show it, by setting `data-intro="play"` on <html> for the
 * first home-page load of a visit. CSS plays it and the same script removes it
 * on a timer or on the first key, tap, click or scroll — so a script that fails
 * leaves no intro rather than a stuck one.
 *
 * The site's last intro was withdrawn (ASSET_CREDITS.md §8) because it played a
 * third-party clip of a city that a visitor would read as this place, and held
 * the page until it was scrolled through. This one carries no picture at all,
 * and holds nothing: it is decorative, hidden from assistive technology, and
 * never shown to a reader who asks for reduced motion.
 */
export function SiteIntro() {
  const words = siteConfig.brandName.trim().split(/\s+/).filter(Boolean);
  const lead = words[0] ?? siteConfig.brandName;
  const tail = words.slice(1).join(" ");
  const place = placeLabel();

  return (
    /* `site-intro` is the stable hook the print and reduced-motion rules in
       app/globals.css address; a CSS-module class cannot be named there. */
    <div className={`${styles.intro} site-intro`} aria-hidden="true">
      <div className={styles.mark}>
        <span className={styles.lead}>{lead}</span>
        {tail ? <span className={styles.tail}>{tail}</span> : null}
      </div>
      <span className={styles.line} />
      {place ? <span className={styles.place}>{place}</span> : null}
    </div>
  );
}
