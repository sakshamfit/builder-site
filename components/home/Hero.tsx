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
 * scroll-jacking, no intro animation.
 *
 * The primary action points at the cinema-hall showcase, because this is a
 * showcase of the venue rather than a booking engine — ticketing is a separate,
 * secondary step that the header and the showtimes section both reach in one
 * tap.
 *
 * The still is a generated illustration, not a photograph of this cinema, so it
 * is marked decorative for assistive technology and captioned as an
 * illustration for everyone else. Approved venue photography replaces it before
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
        {/*
          A still, not a video. No licensed footage of this cinema exists yet,
          and an unlicensed clip would be worse than a quiet image. The slow
          ambient drift is CSS-only, so it costs no extra bytes, cannot
          autoplay audio, and is disabled outright by
          `prefers-reduced-motion: reduce` (see app/globals.css).
        */}
        <Image
          src="/stills/auditorium.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          aria-hidden="true"
          className={styles.heroStill}
        />
      </div>
      <div className={styles.heroScrim} aria-hidden="true" />

      <div className={`container ${styles.heroInner}`}>
        <p className={`eyebrow ${styles.heroEyebrow}`}>{place}</p>
        <h1 className={styles.heroTitle} id="hero-title">
          {siteConfig.brandName}
        </h1>

        <p className={`lede ${styles.heroLede}`}>
          A showcase of the cinema inside Elante Mall, Chandigarh — the auditorium, the screen, the
          foyer and everything between the mall and your seat.
        </p>

        <div className={styles.heroActions}>
          <Button href="#showcase" variant="primary" size="large">
            See the cinema
          </Button>
          <Button href="#showtimes" variant="secondary" size="large">
            Today&rsquo;s showtimes
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
          {isFixture ? <Badge tone="amber">Sample schedule</Badge> : null}
        </p>

        <p className={styles.heroImageNote}>
          Illustrative background — photographs of this cinema are still being supplied.
        </p>
      </div>
    </section>
  );
}
