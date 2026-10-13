import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { MovieGrid } from "@/components/movies/MovieGrid";
import type { Movie } from "@/lib/types";
import type { nextScreeningByFilm } from "@/lib/showtime-view";

/**
 * Now showing.
 *
 * Only films that have a screening in the published window appear here — a
 * film the venue is no longer programming is not "now showing", however
 * recently it was.
 */
export function NowShowing({
  movies,
  nextScreenings,
  isFixture,
  screeningSourceLabel,
}: {
  movies: Movie[];
  nextScreenings: ReturnType<typeof nextScreeningByFilm>;
  isFixture: boolean;
  screeningSourceLabel: string;
}) {
  return (
    <section className="scene-pad" aria-labelledby="now-showing-title">
      <div className="wrap reveal">
        <div className="section-head">
          <div>
            <span className="eyebrow">On screen at this cinema</span>
            <h2 id="now-showing-title">Now showing</h2>
            <p>
              {movies.length} film{movies.length === 1 ? "" : "s"} with screenings in the published
              window. {screeningSourceLabel}
            </p>
          </div>
          <Button href="/movies" variant="outline" size="small">
            All films
          </Button>
        </div>

        {movies.length > 0 ? (
          <MovieGrid movies={movies} nextScreenings={nextScreenings} isFixture={isFixture} />
        ) : (
          <EmptyState title="No films are on sale right now">
            <p>
              The programme has not been published for the coming days. This page updates as soon as
              the cinema publishes its next schedule.
            </p>
          </EmptyState>
        )}
      </div>
    </section>
  );
}
