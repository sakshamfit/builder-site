import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { PosterImage } from "@/components/ui/PosterImage";
import { ShowtimeButton } from "@/components/showtimes/ShowtimeButton";
import { HandoffNotice } from "@/components/showtimes/HandoffNotice";
import { AVAILABILITY_POLICY, PRICE_POLICY } from "@/lib/cinema-content";
import type { MovieGroupView } from "@/lib/showtime-view";
import styles from "./showtimes.module.css";

/**
 * One film's screenings for the selected date, grouped by screen.
 *
 * Grouping by screen matters at a real venue: a visitor who wants 3D, or who
 * needs the ground-floor auditorium, picks the screen first and the time
 * second. Screen and format labels come from the venue record, never from the
 * film's title.
 */
export function ShowtimeGroup({
  group,
  showPoster = true,
  headingLevel = 3,
}: {
  group: MovieGroupView;
  showPoster?: boolean;
  headingLevel?: 2 | 3;
}) {
  const Heading = `h${headingLevel}` as "h2" | "h3";
  const allShowtimes = group.screens.flatMap((screen) => screen.showtimes);

  // The first live handoff in this group, used for the "where this goes" line.
  let destinationNote: string | null = null;
  for (const view of allShowtimes) {
    if (view.booking.kind === "ready") {
      destinationNote = view.booking.note;
      break;
    }
  }

  return (
    <article className={styles.group} aria-labelledby={`group-${group.movie.slug}`}>
      <div className={styles.groupHead}>
        {showPoster ? (
          <PosterImage
            className={styles.groupPoster}
            src={group.movie.posterPath}
            alt={group.movie.posterAlt}
            sizes="60px"
          />
        ) : null}

        <div className={styles.groupTitles}>
          <Heading className={styles.groupTitle} id={`group-${group.movie.slug}`}>
            <Link href={group.href} className={styles.groupTitleLink}>
              {group.movie.title}
            </Link>
          </Heading>

          <p className={styles.groupMeta}>
            {group.languageLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
            {group.runtimeLabel ? (
              <>
                <span className={styles.groupMetaDot} aria-hidden="true">
                  ·
                </span>
                <span>{group.runtimeLabel}</span>
              </>
            ) : null}
            {group.certificationLabel ? (
              <>
                <span className={styles.groupMetaDot} aria-hidden="true">
                  ·
                </span>
                <span>{group.certificationLabel}</span>
              </>
            ) : null}
            <span className={styles.groupMetaDot} aria-hidden="true">
              ·
            </span>
            <span>
              {group.totalShowtimes} show{group.totalShowtimes === 1 ? "" : "s"}
            </span>
          </p>
        </div>
      </div>

      <div className={styles.screens}>
        {group.screens.map((screen) => (
          <div className={styles.screenRow} key={screen.screenId}>
            <p className={styles.screenLabel}>
              <span>{screen.screenName}</span>
              {screen.formats.map((format) => (
                <Badge key={format} tone="plain">
                  {format}
                </Badge>
              ))}
            </p>

            <ul className={styles.chipRow}>
              {screen.showtimes.map((view) => (
                <li key={view.id}>
                  <ShowtimeButton view={view} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <HandoffNotice views={allShowtimes} />

      {/*
        When ticket links are live, the section states plainly where they go.
        The chips stay compact and each one repeats this in its accessible name,
        but a visible sentence means nobody has to hover or click to find out
        they are leaving for a third-party site.
      */}
      {destinationNote ? <p className={styles.destinationNote}>{destinationNote}</p> : null}

      <p className={styles.policyLine}>
        {AVAILABILITY_POLICY} {PRICE_POLICY}
      </p>
    </article>
  );
}
