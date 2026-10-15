import Link from "next/link";
import { CinemaMedia } from "@/components/cinematic/CinemaMedia";
import { MOTION_MEDIA_CREDIT } from "@/data/media";
import { siteConfig } from "@/lib/site-config";
import styles from "./cinematic.module.css";

/**
 * The end card — the curtain call before the footer.
 *
 * Adapted from the `.end-card` in the owner's `gireeshkumarreddy/pk`
 * repository (ASSET_CREDITS.md §11): the name set as large as the screen
 * allows, a film card that opens out of a clip as it arrives, three ways onward
 * and a line of credits. Upstream's card plays the film's title sequence; this
 * one plays the site's own reel of turning rings, and its credits are facts
 * about the venue and the programme rather than about a production.
 */
export function EndCard({ place, filmCount }: { place: string; filmCount: number }) {
  const words = siteConfig.brandName.trim().split(/\s+/).filter(Boolean);
  const lead = words[0] ?? siteConfig.brandName;
  const tail = words.slice(1).join(" ");

  return (
    <section className={styles.end} data-scene="end" data-tone="dark" data-mode="night" aria-labelledby="end-title">
      <p className={styles.endKicker}>Until the lights go down</p>

      <h2 className={styles.endMark} id="end-title" data-j="endMark">
        <span className={styles.endLead}>{lead}</span>
        {tail ? <span className={styles.endTail}>{tail}</span> : null}
      </h2>

      <div className={styles.endCard} data-j="endCard">
        <CinemaMedia media="rings" sizes="(max-width: 1100px) 100vw, 1050px" />
      </div>

      <nav className={styles.endActions} aria-label="Where next">
        <Link href="#programme">
          See the programme <span aria-hidden="true">↑</span>
        </Link>
        <Link href="/cinema">
          Plan your visit <span aria-hidden="true">→</span>
        </Link>
        <a href="#top">
          Back to the beginning <span aria-hidden="true">↑</span>
        </a>
      </nav>

      <ul className={styles.credits}>
        {place ? <li>{place}</li> : null}
        {filmCount > 0 ? <li>{filmCount} films in the programme</li> : null}
        <li>Release dates cited on every film</li>
      </ul>

      <p className={styles.endLegal}>{MOTION_MEDIA_CREDIT}</p>
    </section>
  );
}
