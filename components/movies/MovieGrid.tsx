import { MovieCard } from "@/components/movies/MovieCard";
import type { Movie } from "@/lib/types";
import styles from "./movies.module.css";

/** The catalogue grid. Two columns at 320px, four on a wide screen. */
export function MovieGrid({
  movies,
  nextScreenings,
  isFixture,
}: {
  movies: Movie[];
  nextScreenings: Map<string, { timeLabel: string; relative: string | null; dateLabel: string; dateISO: string }>;
  isFixture: boolean;
}) {
  return (
    <ul className={styles.grid}>
      {movies.map((movie) => {
        const next = nextScreenings.get(movie.slug);
        return (
          <li key={movie.slug}>
            <MovieCard
              movie={movie}
              nextScreening={
                next
                  ? { timeLabel: next.timeLabel, relative: next.relative, dateLabel: next.dateLabel }
                  : null
              }
              isFixture={isFixture}
            />
          </li>
        );
      })}
    </ul>
  );
}
