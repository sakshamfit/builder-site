import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { Showcase } from "@/components/home/Showcase";
import { MarqueeTicker } from "@/components/showcase/MarqueeTicker";
import { NowShowing } from "@/components/home/NowShowing";
import { ComingSoon } from "@/components/home/ComingSoon";
import { CinemaExperience } from "@/components/home/CinemaExperience";
import { VenueInfo } from "@/components/home/VenueInfo";
import { ShowtimeBoard } from "@/components/showtimes/ShowtimeBoard";
import { EmptyState } from "@/components/ui/EmptyState";
import { readClock } from "@/lib/clock";
import { isValidCalendarDate } from "@/lib/date-format";
import { buildMetadata } from "@/lib/metadata";
import { getScheduleSnapshot } from "@/lib/schedule-source";
import { readFilterParams } from "@/lib/share-url";
import { confirmed } from "@/lib/cinema-content";
import { nextScreeningByFilm, summariseSchedule } from "@/lib/showtime-view";
import { venue } from "@/data/cinema";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = buildMetadata({
  title: `${siteConfig.brandName} — showtimes, location and visiting information`,
  description:
    "Today's showtimes and dates for the cinema at Elante Mall, Chandigarh, plus venue location, directions, access information and booking help.",
  path: "/",
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Home.
 *
 * Order follows the brief: hero, what is on now, the date-and-time chooser,
 * what is coming, what the venue is like, and how to get there. The showtime
 * chooser is one tap from the hero and from the header.
 */
export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const clock = readClock();
  const snapshot = await getScheduleSnapshot();

  const requestedDate = readFilterParams(params).date;
  const dateISO =
    requestedDate && isValidCalendarDate(requestedDate) ? requestedDate : clock.todayISO;

  const summaryForMarquee = snapshot.state === "ready"
    ? summariseSchedule(snapshot.showtimes, venue.timezone, clock.todayISO)
    : null;

  const place = [confirmed(venue.address.locality), confirmed(venue.address.region)]
    .filter(Boolean)
    .join(", ");

  /*
   * Marquee content. Only true, useful statements: the venue, where it is, the
   * date and what the schedule actually contains. No invented urgency.
   */
  const marqueeItems = [
    siteConfig.brandName,
    place || "Chandigarh",
    summaryForMarquee?.totalScreenings
      ? `${summaryForMarquee.totalScreenings} screenings listed`
      : null,
    summaryForMarquee?.lastDateLabel ? `Listings to ${summaryForMarquee.lastDateLabel}` : null,
    siteConfig.isFixtureMode ? "Sample schedule — not a real programme" : null,
  ].filter((item): item is string => Boolean(item));

  if (snapshot.state !== "ready") {
    return (
      <>
        <Hero
          todayISO={clock.todayISO}
          screeningsToday={0}
          place={place}
          isFixture={siteConfig.isFixtureMode}
        />
        <MarqueeTicker
          items={marqueeItems}
          label={`${siteConfig.brandName}, ${place || "Chandigarh"}. Schedule currently unavailable.`}
        />

        <Showcase />

        <section className="scene-pad sceneAlt" id="showtimes">
          <div className="wrap reveal">
            <div className="section-head">
              <div>
                <span className="eyebrow">When you are ready to book</span>
                <h2>Showtimes</h2>
              </div>
            </div>
            <EmptyState title="Showtimes are unavailable right now">
              <p>{snapshot.reason}</p>
              <p>
                The hall showcase, location and visiting information above are unaffected — only the
                schedule is missing.
              </p>
            </EmptyState>
          </div>
        </section>
        <ComingSoon movies={[]} isFixture={siteConfig.isFixtureMode} />
        <CinemaExperience />
        <VenueInfo />
      </>
    );
  }

  const summary = summariseSchedule(snapshot.showtimes, venue.timezone, clock.todayISO);
  const nextScreenings = nextScreeningByFilm(
    snapshot.showtimes,
    venue.timezone,
    clock.todayISO,
    clock.nowISO,
  );
  /*
   * The catalogue comes from whichever source is active — the partner payload in
   * live mode, the labelled fixtures in development. A film is "now showing" only
   * when it also has a screening in the published window.
   */
  const catalogue = snapshot.catalogue;
  const showingNow = catalogue.filter(
    (movie) => movie.status === "now_showing" && nextScreenings.has(movie.slug),
  );
  const upcoming = catalogue
    .filter((movie) => movie.status === "coming_soon")
    .sort((a, b) => (a.releaseDate ?? "").localeCompare(b.releaseDate ?? ""));

  return (
    <>
      <Hero
        todayISO={clock.todayISO}
        screeningsToday={summary.screeningsToday}
        place={place}
        isFixture={siteConfig.isFixtureMode}
      />

      <MarqueeTicker
        items={marqueeItems}
        label={`${siteConfig.brandName}, ${place || "Chandigarh"}. ${summaryForMarquee?.totalScreenings ?? 0} screenings listed.`}
      />

      <Showcase />

      <NowShowing
        movies={showingNow}
        nextScreenings={nextScreenings}
        isFixture={siteConfig.isFixtureMode}
        screeningSourceLabel={
          summary.lastDateLabel ? `Listings run to ${summary.lastDateLabel}.` : ""
        }
      />

      <section className="scene-pad sceneAlt" id="showtimes" tabIndex={-1}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">When you are ready to book</span>
              <h2>Showtimes</h2>
              <p>
                This site shows the hall; tickets are handled by the venue&rsquo;s ticketing partner.
                Pick a day, then choose a screening — each card shows the screen, format and language
                the venue has assigned to it.
              </p>
            </div>
          </div>

          <ShowtimeBoard
            snapshot={snapshot}
            movies={catalogue}
            venue={snapshot.venue}
            dateISO={dateISO}
            todayISO={clock.todayISO}
            nowISO={clock.nowISO}
            basePath="/"
            filters={{}}
            headingLevel={3}
          />
        </div>
      </section>

      <ComingSoon movies={upcoming} isFixture={siteConfig.isFixtureMode} />
      <CinemaExperience />
      <VenueInfo />
    </>
  );
}
