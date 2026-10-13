import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { PosterImage } from "@/components/ui/PosterImage";
import { formatDateLong, formatRuntime } from "@/lib/date-format";
import type { Movie } from "@/lib/types";
import moviesStyles from "@/components/movies/movies.module.css";
import styles from "./home.module.css";

/**
 * Coming soon.
 *
 * Kept below the current programme and deliberately quieter: no ticket action,
 * because there is nothing on sale yet. A release date is shown only when the
 * record carries one.
 */
export function ComingSoon({ movies, isFixture }: { movies: Movie[]; isFixture: boolean }) {
  if (movies.length === 0) return null;

  return (
    <section className={`section ${styles.sectionAlt}`} aria-labelledby="coming-soon-title">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Later this season</span>
            <h2 id="coming-soon-title">Coming soon</h2>
            <p>
              Titles the cinema has confirmed are on the way. Showtimes appear here once they are
              published and on sale.
            </p>
          </div>
        </div>

        <ul className={styles.comingGrid}>
          {movies.map((movie) => {
            const runtime = formatRuntime(movie.runtimeMinutes);
            return (
              <li className={styles.comingItem} key={movie.slug}>
                <PosterImage
                  src={movie.posterPath}
                  alt={movie.posterAlt}
                  sizes="(min-width: 640px) 30vw, 46vw"
                />
                <h3 className={styles.comingTitle}>
                  <Link href={`/movies/${movie.slug}`} className={moviesStyles.cardLink}>
                    {movie.title}
                  </Link>
                </h3>
                <p className={styles.comingMeta}>
                  {movie.releaseDate ? (
                    <span className={styles.comingDate}>
                      From {formatDateLong(movie.releaseDate)}
                    </span>
                  ) : (
                    <span>Release date to be confirmed</span>
                  )}
                </p>
                <p className={styles.comingMeta}>
                  <span>{movie.languages.map((language) => language.label).join(", ")}</span>
                  {runtime ? (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{runtime}</span>
                    </>
                  ) : null}
                </p>
                {isFixture ? <Badge tone="amber">Sample title</Badge> : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
