import type { Metadata } from "next";
import { MovieFilters } from "@/components/movies/MovieFilters";
import { MovieGrid } from "@/components/movies/MovieGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { ScheduleStatus } from "@/components/showtimes/ScheduleStatus";
import { readClock } from "@/lib/clock";
import { buildMetadata } from "@/lib/metadata";
import { describeHealth, getScheduleSnapshot } from "@/lib/schedule-source";
import { readFilterParams } from "@/lib/share-url";
import { nextScreeningByFilm } from "@/lib/showtime-view";
import { languageLabel, movies } from "@/data/movies";
import { venue } from "@/data/cinema";
import type { Movie } from "@/lib/types";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = buildMetadata({
  title: "Movies",
  description:
    "Every film with screenings at the cinema at Elante Mall, Chandigarh. Filter by language and format, then choose a date to see showtimes.",
  path: "/movies",
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * What is on, and the filters to narrow it.
 *
 * Filter options are derived from the schedule itself: a language or format is
 * only offered when a screening actually exists in it. An empty filter result
 * is a normal state, so it gets a real explanation and a way back.
 */
export default async function MoviesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const clock = readClock();
  const snapshot = await getScheduleSnapshot();

  if (snapshot.state !== "ready") {
    return (
      <div className="container section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Programme</span>
            <h1>Movies</h1>
          </div>
        </div>
        <EmptyState title="The film list is unavailable right now">
          <p>{snapshot.reason}</p>
          <p>
            We would rather show you nothing than a list that might be out of date. Please try again
            shortly, or check the cinema&rsquo;s location and opening details in the meantime.
          </p>
          {process.env.NODE_ENV !== "production" ? (
            <p className="small muted">Diagnostic: {snapshot.detail}</p>
          ) : null}
        </EmptyState>
      </div>
    );
  }

  const { showtimes, lastUpdated, sourceLabel, notice, health } = snapshot;
  const upcoming = showtimes.filter(
    (showtime) => Date.parse(showtime.startsAt) >= Date.parse(clock.nowISO),
  );

  // What each film actually offers in the current programme.
  const offerBySlug = new Map<string, { languages: Set<string>; formats: Set<string> }>();
  for (const showtime of upcoming) {
    const entry = offerBySlug.get(showtime.movieSlug) ?? {
      languages: new Set<string>(),
      formats: new Set<string>(),
    };
    entry.languages.add(showtime.languageCode);
    entry.formats.add(showtime.format);
    offerBySlug.set(showtime.movieSlug, entry);
  }

  const catalogue: Movie[] = movies.filter((movie) => offerBySlug.has(movie.slug));

  const facetCount = (
    group: "languages" | "formats",
    value: string,
  ): number => catalogue.filter((movie) => offerBySlug.get(movie.slug)?.[group].has(value)).length;

  const languageValues = [
    ...new Set(catalogue.flatMap((movie) => [...(offerBySlug.get(movie.slug)?.languages ?? [])])),
  ].sort();

  const formatValues = [
    ...new Set(catalogue.flatMap((movie) => [...(offerBySlug.get(movie.slug)?.formats ?? [])])),
  ].sort();

  const filters = readFilterParams(params, { languages: languageValues, formats: formatValues });

  const visible = catalogue.filter((movie) => {
    const offer = offerBySlug.get(movie.slug);
    if (!offer) return false;
    if (filters.language && !offer.languages.has(filters.language)) return false;
    if (filters.format && !offer.formats.has(filters.format)) return false;
    return true;
  });

  const nextScreenings = nextScreeningByFilm(
    showtimes,
    venue.timezone,
    clock.todayISO,
    clock.nowISO,
  );

  const healthReport = describeHealth(health);

  return (
    <div className="container section">
      <div className="section-head">
        <div>
          <span className="eyebrow">Programme</span>
          <h1>Movies</h1>
          <p>
            {catalogue.length} film{catalogue.length === 1 ? "" : "s"} with screenings published.
            Choose a film to see its dates and times.
          </p>
        </div>
      </div>

      <ScheduleStatus
        lastUpdated={lastUpdated}
        sourceLabel={sourceLabel}
        notice={notice}
        nowISO={clock.nowISO}
      />

      {process.env.NODE_ENV !== "production" && healthReport ? (
        <pre className="note small" style={{ whiteSpace: "pre-wrap" }}>
          {healthReport}
        </pre>
      ) : null}

      <MovieFilters
        languages={languageValues.map((value) => ({
          value,
          label: languageLabel(value, catalogue),
          count: facetCount("languages", value),
        }))}
        formats={formatValues.map((value) => ({
          value,
          label: value,
          count: facetCount("formats", value),
        }))}
        selected={filters}
        basePath="/movies"
        filters={filters}
        resultCount={visible.length}
        totalCount={catalogue.length}
      />

      {visible.length > 0 ? (
        <MovieGrid
          movies={visible}
          nextScreenings={nextScreenings}
          isFixture={siteConfig.isFixtureMode}
        />
      ) : (
        <EmptyState
          title="No films match those filters"
          action={
            <Button href="/movies" variant="secondary" size="small">
              Show every film
            </Button>
          }
        >
          <p>
            Nothing in the current programme matches that combination of language and format. The
            programme changes weekly, so it is worth checking back.
          </p>
        </EmptyState>
      )}
    </div>
  );
}
