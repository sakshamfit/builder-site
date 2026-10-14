import { Button } from "@/components/ui/Button";
import { ScrollCue } from "@/components/home/ScrollCue";
import { siteConfig } from "@/lib/site-config";
import { formatDateLong } from "@/lib/date-format";
import styles from "./home.module.css";

/**
 * Splits the configured brand name across two lines so the second half can take
 * the accent colour.
 *
 * Derived from config rather than hardcoded: when the operator sets the
 * confirmed trade name, the hero must follow it. A name with no "at" renders as
 * a single line, and nothing is invented to fill a second one.
 */
function splitBrandName(name: string): string[] {
  const marker = name.toLowerCase().indexOf(" at ");
  if (marker === -1) return [name];
  return [name.slice(0, marker + 3).trim(), name.slice(marker + 4).trim()];
}

/**
 * Hero.
 *
 * A full-height opening scene built from type alone: a ruled overline, the venue
 * name set as large as the viewport allows, and a ruled footer carrying the date
 * and the actions.
 *
 * Deliberately NOT carried over from the design reference: the cinematic
 * back-drop. This project previously used a generated illustration of a generic
 * auditorium behind this heading, which was removed — a picture of some cinema
 * behind the name of this cinema reads as a photograph of it, and it is not one.
 * The typography carries the opening scene instead, and the hero is quieter and
 * more confident for it.
 *
 * No autoplaying video, no scroll-jacking, no intro animation that delays
 * content.
 */
export function Hero({
  todayISO,
  place,
  leadingFilmSlug,
  leadingFilmTitle,
  upcomingCount,
}: {
  todayISO: string;
  place: string;
  /** The film opening soonest, used for the primary action's label. */
  leadingFilmSlug: string | null;
  leadingFilmTitle: string | null;
  /** How many announced releases are still to come. */
  upcomingCount: number;
}) {
  const titleLines = splitBrandName(siteConfig.brandName);
  const [firstLine, secondLine] = titleLines;

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={`wrap ${styles.heroInner}`}>
        <div className={styles.heroOverline}>
          <span>{place}</span>
          <span className={styles.heroOverlineRight}>{formatDateLong(todayISO)}</span>
        </div>

        <h1 className={styles.heroTitle} id="hero-title">
          <span className={styles.heroTitleLine}>{firstLine}</span>
          {secondLine ? (
            <span className={`${styles.heroTitleLine} ${styles.heroTitleAccent}`}>{secondLine}</span>
          ) : null}
        </h1>

        <p className={`script ${styles.heroScript}`}>
          {upcomingCount > 0
            ? `${upcomingCount} announced release${upcomingCount === 1 ? "" : "s"} in the programme, every date taken from a published release calendar and cited where you read it.`
            : "The hall, the location, and the films on their way to it."}
        </p>

        <div className={styles.heroBottom}>
          <div className={styles.heroMeta}>
            <p>Inside {place}</p>
            <p className={styles.heroImageNote}>
              Venue details come from the cinema&rsquo;s owner. Film dates come from published
              release calendars, cited on every film.
            </p>
          </div>

          <div className={styles.heroActions}>
            <Button href="#showcase" variant="red">
              See the cinema <span aria-hidden="true">↓</span>
            </Button>
            {leadingFilmSlug ? (
              <Button href={`/movies/${leadingFilmSlug}`} variant="outline">
                {leadingFilmTitle ?? "Next release"} <span aria-hidden="true">→</span>
              </Button>
            ) : (
              <Button href="/movies" variant="outline">
                The programme <span aria-hidden="true">→</span>
              </Button>
            )}
          </div>
        </div>

        {/* Decorative, and absent entirely for readers who ask for reduced motion. */}
        <ScrollCue />
      </div>
    </section>
  );
}
