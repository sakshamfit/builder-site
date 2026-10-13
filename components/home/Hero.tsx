import Image from "next/image";
import { Button } from "@/components/ui/Button";
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
 * A full-height poster: a ruled overline, the venue name set as large as the
 * viewport allows, and a ruled footer line carrying the date and the actions.
 * The still sits behind at low opacity so the type stays dominant — it is a
 * texture, not the subject.
 *
 * No autoplaying video, no scroll-jacking, no intro animation that delays
 * content. The still is a generated illustration, not a photograph of this
 * cinema, and is captioned as such.
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
  const titleLines = splitBrandName(siteConfig.brandName);
  const [firstLine, secondLine] = titleLines;

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.heroStill} aria-hidden="true">
        <Image src="/stills/auditorium.jpg" alt="" fill priority sizes="100vw" />
      </div>

      <div className={`wrap ${styles.heroInner}`}>
        <div className={styles.heroOverline}>
          <span>{isFixture ? "Development preview" : "Now showing"}</span>
          <span className={styles.heroOverlineRight}>{place}</span>
        </div>

        <h1 className={styles.heroTitle} id="hero-title">
          <span className={styles.heroTitleLine}>{firstLine}</span>
          {secondLine ? (
            <span className={`${styles.heroTitleLine} ${styles.heroTitleAccent}`}>{secondLine}</span>
          ) : null}
        </h1>

        <p className={`script ${styles.heroScript}`}>
          Inside Elante Mall, Chandigarh — the auditorium, the screen, the seating, and everything
          between the mall and your seat.
        </p>

        <div className={styles.heroBottom}>
          <div className={styles.heroMeta}>
            <p>{formatDateLong(todayISO)}</p>
            {screeningsToday > 0 ? (
              <p className={styles.heroCount}>
                {screeningsToday} screening{screeningsToday === 1 ? "" : "s"} listed today
              </p>
            ) : null}
            <p className={styles.heroImageNote}>
              Illustrative background — photographs of this cinema are still being supplied.
            </p>
          </div>

          <div className={styles.heroActions}>
            <Button href="#showcase" variant="red">
              See the cinema <span aria-hidden="true">↓</span>
            </Button>
            <Button href="#showtimes" variant="outline">
              Showtimes <span aria-hidden="true">→</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
