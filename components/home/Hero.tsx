import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site-config";
import { formatDateLong } from "@/lib/date-format";
import styles from "./home.module.css";

/**
 * Home hero.
 *
 * One still, one message, one primary action. No autoplaying video, no
 * scroll-jacking, no intro animation: the showtime chooser is reachable
 * immediately below.
 *
 * The still is a generated placeholder, not a photograph of this cinema, so it
 * is marked decorative for assistive technology and captioned as a placeholder
 * for everyone else. Venue photography or licensed key art replaces it before
 * launch (see ASSET_CREDITS.md).
 */
export function Hero({
  todayISO,
  screeningsToday,
  place,
  isFixture,
}: {
  todayISO: string;
  screeningsToday: number;
  place: string;
  isFixture: boolean;
}) {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.heroMedia}>
        <Image
          src="/stills/auditorium.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          aria-hidden="true"
        />
      </div>
      <div className={styles.heroScrim} aria-hidden="true" />

      <div className={`container ${styles.heroInner}`}>
        <p className={`eyebrow ${styles.heroEyebrow}`}>{place}</p>
        <h1 className={styles.heroTitle} id="hero-title">
          {siteConfig.brandName}
        </h1>

        <p className={`lede ${styles.heroLede}`}>
          Find what is playing, choose a date, and continue to the venue&rsquo;s ticketing partner to
          complete your booking. Location, access, timings and help all live here too.
        </p>

        <div className={styles.heroActions}>
          <Button href="#showtimes" variant="primary" size="large">
            View showtimes
          </Button>
          <Button href="/cinema" variant="secondary" size="large">
            Plan your visit
          </Button>
        </div>

        <p className={styles.heroMeta}>
          <span>{formatDateLong(todayISO)}</span>
          {screeningsToday > 0 ? (
            <>
              <span aria-hidden="true">·</span>
              <span>
                {screeningsToday} screening{screeningsToday === 1 ? "" : "s"} listed today
              </span>
            </>
          ) : null}
          {isFixture ? <Badge tone="amber">Sample data</Badge> : null}
        </p>

        <p className={styles.heroImageNote}>
          Placeholder image: venue photography has not been supplied yet.
        </p>
      </div>
    </section>
  );
}
