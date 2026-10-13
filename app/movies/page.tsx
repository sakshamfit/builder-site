import type { Metadata } from "next";
import { MovieFilters } from "@/components/movies/MovieFilters";
import { ProgrammeBoard } from "@/components/programme/ProgrammeBoard";
import { ScheduleWait } from "@/components/programme/ScheduleWait";
import { ScheduleStatus } from "@/components/showtimes/ScheduleStatus";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { readClock } from "@/lib/clock";
import { buildMetadata } from "@/lib/metadata";
import { describeHealth, getScheduleSnapshot } from "@/lib/schedule-source";
import { loadProgramme } from "@/lib/programme";
import { readFilterParams } from "@/lib/share-url";
import { nextScreeningByFilm } from "@/lib/showtime-view";
import { languageLabel } from "@/lib/language-label";
import type { Movie } from "@/lib/types";

export const metadata: Metadata = buildMetadata({
  title: "Film programme",
  description:
    "Films in cinemas and announced for release, with sourced release dates, at the cinema at Elante Mall, Chandigarh.",
  path: "/movies",
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * The film programme.
 *
 * Two sources can feed this page, and the page is explicit about which one is
 * live. On the sourced release calendar there are no filters and no showtimes,
 * because there is nothing to filter by and no timetable to narrow — languages
 * and formats in the filter row are derived from actual screenings, and a filter
 * that cannot match anything is worse than no filter.
 *
 * With a venue feed connected, the same page becomes a schedule view: real
 * screenings, filterable by the languages and formats the venue has actually
 * scheduled.
 */
export default async function MoviesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const clock = readClock();
  const snapshot = await getScheduleSnapshot();

  if (snapshot.state !== "ready") {
    return (
      <div className="wrap scene-pad">
        <div className="section-head">
          <div>
            <span className="eyebrow">Programme</span>
            <h1>Films</h1>
          </div>
        </div>
        <EmptyState title="The film programme is unavailable right now">
          <p>{snapshot.reason}</p>
          <p>
            We would rather show you nothing than a list that might be out of date. Please try again
            shortly, or check the cinema&rsquo;s location and visiting details in the meantime.
          </p>
          {process.env.NODE_ENV !== "production" ? (
            <p className="small muted">Diagnostic: {snapshot.detail}</p>
          ) : null}
        </EmptyState>
      </div>
    );
  }

  const catalogue: Movie[] = snapshot.catalogue;
  const programme = snapshot.mode === "programme" ? loadProgramme() : null;

  /* ---------------------------------------------------------------- no feed */
  if (!snapshot.scheduleAvailable || snapshot.mode === "programme") {
    const released = catalogue.filter((movie) => movie.status === "now_showing").length;
    const upcoming = catalogue.filter((movie) => movie.status === "coming_soon").length;

    return (
      <div className="wrap scene-pad">
        <div className="section-head">
          <div>
            <span className="eyebrow">Programme</span>
            <h1>Films</h1>
            <p>
              {catalogue.length} film{catalogue.length === 1 ? "" : "s"} — {released} in cinemas,{" "}
              {upcoming} announced. Release dates are sourced and cited; screening times at this
              cinema are not published yet.
            </p>
          </div>
        </div>

        <ProgrammeBoard
          movies={catalogue}
          caveat={snapshot.notice}
          citations={programme?.citations ?? []}
          showCitations={programme !== null}
        />

        <div style={{ marginTop: "2.5rem" }}>
          <ScheduleWait variant="page" />
        </div>

        <p className="small muted" style={{ marginTop: "1.5rem" }}>
          <Button href="/cinema" variant="ghost" size="small">
            Venue, location and access information
          </Button>
        </p>
      </div>
    );
  }

  /* ------------------------------------------------------------- live feed */
  const { showtimes, lastUpdated, sourceLabel, notice, health } = snapshot;
  const upcomingShowtimes = showtimes.filter(
    (showtime) => Date.parse(showtime.startsAt) >= Date.parse(clock.nowISO),
  );

  // What each film actually offers in the current programme.
  const offerBySlug = new Map<string, { languages: Set<string>; formats: Set<string> }>();
  for (const showtime of upcomingShowtimes) {
    const entry = offerBySlug.get(showtime.movieSlug) ?? {
      languages: new Set<string>(),
      formats: new Set<string>(),
    };
    entry.languages.add(showtime.languageCode);
    entry.formats.add(showtime.format);
    offerBySlug.set(showtime.movieSlug, entry);
  }

  const facetCount = (group: "languages" | "formats", value: string): number =>
    catalogue.filter((movie) => offerBySlug.get(movie.slug)?.[group].has(value)).length;

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
    snapshot.venue.timezone,
    clock.todayISO,
    clock.nowISO,
  );

  const healthReport = health ? describeHealth(health) : null;

  return (
    <div className="wrap scene-pad">
      <div className="section-head">
        <div>
          <span className="eyebrow">Programme</span>
          <h1>Films</h1>
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
        <section className="scene-pad reveal" aria-labelledby="programme-title">
          <h2 className="visually-hidden" id="programme-title">
            Programme
          </h2>
          <ProgrammeBoard
            movies={visible}
            caveat={null}
            citations={[]}
            showCitations={false}
          />
          {nextScreenings.size === 0 ? (
            <p className="small muted" style={{ marginTop: "1rem" }}>
              No screenings are currently on sale.
            </p>
          ) : null}
        </section>
      ) : (
        <EmptyState
          title="No films match those filters"
          action={
            <Button href="/movies" variant="outline" size="small">
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
