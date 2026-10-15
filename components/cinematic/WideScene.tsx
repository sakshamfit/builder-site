import Link from "next/link";
import { CinemaMedia } from "@/components/cinematic/CinemaMedia";
import { MOTION_MEDIA_CREDIT } from "@/data/media";
import { siteConfig } from "@/lib/site-config";
import styles from "./cinematic.module.css";

/**
 * The wide scene — the programme, introduced at full width.
 *
 * Adapted from the `.wide-scene` in the owner's `gireeshkumarreddy/pk`
 * repository (ASSET_CREDITS.md §11): a picture that opens upward out of a clip
 * as it arrives and drifts slower than the page once it is there, with the copy
 * set to one side. Upstream's picture is a still from a feature film; this one
 * is the site's own gallery render, and the copy states two counts read from
 * the programme record, nothing more.
 */
export function WideScene({ filmCount, languageCount }: { filmCount: number; languageCount: number }) {
  return (
    <section
      className={styles.wide}
      data-scene="wide"
      data-tone="dark"
      data-mode="night"
      aria-labelledby="wide-title"
    >
      <div className={styles.wideMedia} data-j="wideMedia">
        <CinemaMedia media="gallery" sizes="100vw" />
      </div>
      <div className={styles.wideShade} aria-hidden="true" />

      <div className={styles.wideCopy} data-j="wideCopy">
        <p className={styles.kicker}>
          <span>The programme</span>
        </p>
        <h2 className={styles.wideTitle} id="wide-title">
          {filmCount} films.
          <br />
          {languageCount} languages.
        </h2>
        <p className={styles.wideText}>
          The release calendar for cinemas in India, every date cited to the source that published it.
          This cinema&rsquo;s own screening times appear here once its ticketing partner connects.
        </p>
        <Link href="#programme" className={styles.textLink}>
          See the programme <span aria-hidden="true">↓</span>
        </Link>
      </div>

      <div className={styles.wideBottom}>
        <span>{siteConfig.brandName}</span>
        <span className={styles.wideCredit}>{MOTION_MEDIA_CREDIT}</span>
      </div>
    </section>
  );
}
