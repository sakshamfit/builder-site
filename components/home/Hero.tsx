import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site-config";
import { formatDateLong } from "@/lib/date-format";
import styles from "./home.module.css";

/**
 * Splits the configured brand name across two lines so the second half can take
 * the gold gradient.
 *
 * Derived from config rather than hardcoded: when the operator sets the
 * confirmed trade name, the hero must follow it. A name with no "at" renders as
 * a single line, and nothing is ever invented to fill a second one.
 */
function splitBrandName(name: string): string[] {
  const marker = name.toLowerCase().indexOf(" at ");
  if (marker === -1) return [name];
  return [name.slice(0, marker + 3).trim(), name.slice(marker + 4).trim()];
}

/**
 * Home hero.
 *
 * A single still under a heavy scrim with the venue name set large and
 * condensed — the film one-sheet treatment. No autoplaying video, no
 * scroll-jacking, no intro animation that delays the content.
 *
 * The primary action points at the cinema-hall showcase, because this is a
 * showcase of the venue rather than a booking engine. Showtimes remain one tap
 * away in the header and in the hero's secondary action.
 *
 * The still is a generated illustration, not a photograph of this cinema, so it
 * is marked decorative for assistive technology and captioned as an
 * illustration for everyone else.
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
          className={styles.heroStill}
        />
      </div>
      <div className={styles.heroScrim} aria-hidden="true" />
      <div className={styles.heroGlow} aria-hidden="true" />

      <div className={`container ${styles.heroInner}`}>
        <p className={`eyebrow ${styles.heroEyebrow}`}>{place}</p>

        <h1 className={styles.heroTitle} id="hero-title">
          {titleLines.map((line, index) => (
            <span
              key={line}
              className={
                index === titleLines.length - 1 && titleLines.length > 1
                  ? `${styles.heroTitleLine} grad-text`
                  : styles.heroTitleLine
              }
            >
              {line}
            </span>
          ))}
        </h1>

        <p className={`lede ${styles.heroLede}`}>
          A showcase of the cinema inside Elante Mall, Chandigarh — the auditorium, the screen, the
          seating and everything between the mall and your seat.
        </p>

        <div className={styles.heroActions}>
          <Button href="#showcase" variant="primary" size="large">
            See the cinema
          </Button>
          <Button href="#showtimes" variant="secondary" size="large">
            Today&rsquo;s showtimes
          </Button>
        </div>

        <ul className={styles.heroMeta}>
          <li>{formatDateLong(todayISO)}</li>
          {screeningsToday > 0 ? (
            <li>
              <span aria-hidden="true">·</span> {screeningsToday} screening
              {screeningsToday === 1 ? "" : "s"} listed today
            </li>
          ) : null}
          {isFixture ? (
            <li>
              <Badge tone="amber">Sample schedule</Badge>
            </li>
          ) : null}
        </ul>

        <p className={styles.heroImageNote}>
          Illustrative background — photographs of this cinema are still being supplied.
        </p>
      </div>
    </section>
  );
}
