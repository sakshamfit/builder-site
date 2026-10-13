import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
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
import { comingSoon, nowShowing } from "@/data/movies";
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

  const place = [confirmed(venue.address.locality), confirmed(venue.address.region)]
    .filter(Boolean)
    .join(", ");

  if (snapshot.state !== "ready") {
    return (
      <>
        <Hero
          todayISO={clock.todayISO}
          screeningsToday={0}
          place={place}
          isFixture={siteConfig.isFixtureMode}
        />
        <section className="section" id="showtimes">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Choose a date</span>
                <h2>Showtimes</h2>
              </div>
            </div>
            <EmptyState title="Showtimes are unavailable right now">
              <p>{snapshot.reason}</p>
              <p>
                The rest of this page still works: you can check the location, plan your visit and
                read the booking help.
              </p>
            </EmptyState>
          </div>
        </section>
        <ComingSoon movies={comingSoon} isFixture={siteConfig.isFixtureMode} />
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
  const showingNow = nowShowing.filter((movie) => nextScreenings.has(movie.slug));

  return (
    <>
      <Hero
        todayISO={clock.todayISO}
        screeningsToday={summary.screeningsToday}
        place={place}
        isFixture={siteConfig.isFixtureMode}
      />

      <NowShowing
        movies={showingNow}
        nextScreenings={nextScreenings}
        isFixture={siteConfig.isFixtureMode}
        screeningSourceLabel={
          summary.lastDateLabel ? `Listings run to ${summary.lastDateLabel}.` : ""
        }
      />

      <section className="section section--tight" id="showtimes" tabIndex={-1}>
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Choose a date</span>
              <h2>Showtimes</h2>
              <p>
                Pick a day, then choose a screening. Each card shows the screen, format and language
                the venue has assigned to it.
              </p>
            </div>
          </div>

          <ShowtimeBoard
            snapshot={snapshot}
            movies={nowShowing}
            venue={venue}
            dateISO={dateISO}
            todayISO={clock.todayISO}
            nowISO={clock.nowISO}
            basePath="/"
            filters={{}}
            headingLevel={3}
          />
        </div>
      </section>

      <ComingSoon movies={comingSoon} isFixture={siteConfig.isFixtureMode} />
      <CinemaExperience />
      <VenueInfo />
    </>
  );
}
