import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { PosterImage } from "@/components/ui/PosterImage";
import { formatRuntime } from "@/lib/date-format";
import type { Movie } from "@/lib/types";
import styles from "./movies.module.css";

/**
 * A film in the catalogue.
 *
 * Shows only what the record actually contains: language, runtime and
 * certification appear when the source supplied them, and are omitted — not
 * guessed — when it did not. Formats are listed from the venue's own
 * assignment, never inferred from the title.
 */
export function MovieCard({
  movie,
  nextScreening,
  isFixture,
}: {
  movie: Movie;
  /** "Next: today 6:15 pm", when this film has an upcoming screening. */
  nextScreening?: { timeLabel: string; relative: string | null; dateLabel: string } | null;
  /** True while the catalogue is a development fixture. */
  isFixture: boolean;
}) {
  const runtime = formatRuntime(movie.runtimeMinutes);

  return (
    <article className={styles.card}>
      <PosterImage
        className={styles.posterWrap}
        src={movie.posterPath}
        alt={movie.posterAlt}
        sizes="(min-width: 1000px) 25vw, (min-width: 640px) 33vw, 46vw"
      />

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>
          <Link href={`/movies/${movie.slug}`} className={styles.cardLink}>
            {movie.title}
          </Link>
        </h3>

        <p className={styles.cardMeta}>
          <span>{movie.languages.map((language) => language.label).join(", ")}</span>
          {runtime ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{runtime}</span>
            </>
          ) : null}
          {movie.certification ? (
            <>
              <span aria-hidden="true">·</span>
              <span>
                {movie.certification.label}
                <span className="visually-hidden"> certification, {movie.certification.body}</span>
              </span>
            </>
          ) : null}
        </p>

        {movie.formats.length > 0 ? (
          <p className={styles.cardBadges}>
            {movie.formats.map((format) => (
              <Badge key={format} tone="plain">
                {format}
              </Badge>
            ))}
          </p>
        ) : null}

        {nextScreening ? (
          <p className={styles.cardNext}>
            Next: {nextScreening.relative ?? nextScreening.dateLabel}, {nextScreening.timeLabel}
          </p>
        ) : null}

        {isFixture ? (
          <p className={styles.placeholderTag}>Sample title · placeholder artwork</p>
        ) : null}
      </div>
    </article>
  );
}
