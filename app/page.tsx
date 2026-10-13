import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { Showcase } from "@/components/home/Showcase";
import { MarqueeTicker } from "@/components/showcase/MarqueeTicker";
import { CinemaExperience } from "@/components/home/CinemaExperience";
import { VenueInfo } from "@/components/home/VenueInfo";
import { ProgrammeBoard, ProgrammeFooterLink } from "@/components/programme/ProgrammeBoard";
import { ScheduleWait } from "@/components/programme/ScheduleWait";
import { ShowtimeBoard } from "@/components/showtimes/ShowtimeBoard";
import { EmptyState } from "@/components/ui/EmptyState";
import { readClock } from "@/lib/clock";
import { formatDateLong, isValidCalendarDate } from "@/lib/date-format";
import { buildMetadata } from "@/lib/metadata";
import { getScheduleSnapshot } from "@/lib/schedule-source";
import { loadProgramme } from "@/lib/programme";
import { readFilterParams } from "@/lib/share-url";
import { confirmed } from "@/lib/cinema-content";
import { summariseSchedule } from "@/lib/showtime-view";
import { venue } from "@/data/cinema";
import { siteConfig } from "@/lib/site-config";
import programmeStyles from "@/components/programme/programme.module.css";

export const metadata: Metadata = buildMetadata({
  title: `${siteConfig.brandName} — programme, location and visiting information`,
  description:
    "The film programme, venue location, directions and visiting information for the cinema at Madhuban, Bihar.",
  path: "/",
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Home.
 *
 * Order, deliberately: the hall first, then what is on, then when you can see it.
 * The venue showcase leads because this is a venue site; the schedule follows
 * because it is the only reason a visitor needs a timetable at all.
 *
 * The programme shown here is the sourced release calendar — real films, real
 * announced release dates, each one cited. Whether this cinema is screening any
 * of them is a separate question, answered only by the venue's own feed, and the
 * page keeps the two apart in words rather than blending them into one confident
 * list.
 */
export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const clock = readClock();
  const snapshot = await getScheduleSnapshot();

  /* Where the cinema is, read from the venue record rather than typed again.
     The town and state were supplied by the owner, so this is never a guess. */
  const place = [confirmed(venue.address.locality), confirmed(venue.address.region)]
    .filter(Boolean)
    .join(", ");

  if (snapshot.state !== "ready") {
    return (
      <>
        <Hero
          todayISO={clock.todayISO}
          place={place}
          leadingFilmSlug={null}
          leadingFilmTitle={null}
          upcomingCount={0}
        />
        <MarqueeTicker
          items={[siteConfig.brandName, place || "Bihar"]}
          label={`${siteConfig.brandName}, ${place || "Bihar"}. The film programme could not be read.`}
        />

        <Showcase />

        <section className="scene-pad sceneAlt">
          <div className="wrap reveal">
            <div className="section-head">
              <div>
                <span className="eyebrow">The programme</span>
                <h2>Films</h2>
              </div>
            </div>
            <EmptyState title="The film programme is unavailable right now">
              <p>{snapshot.reason}</p>
              <p>
                The hall showcase, location and visiting information on this page are unaffected —
                only the programme is missing.
              </p>
            </EmptyState>
          </div>
        </section>

        <CinemaExperience />
        <VenueInfo />
      </>
    );
  }

  const catalogue = snapshot.catalogue;
  const programme = snapshot.mode === "programme" ? loadProgramme() : null;

  /*
   * The programme, showing the next few releases on the home page and the rest
   * behind the link. Everything on this page is derived from the same record the
   * film page renders, so the two can never disagree.
   */
  const preview = programme
    ? [...catalogue.filter((movie) => movie.status === "now_showing").slice(0, 4), ...catalogue.filter((movie) => movie.status === "coming_soon").slice(0, 8)]
    : catalogue.slice(0, 12);

  const upcoming = catalogue.filter((movie) => movie.status === "coming_soon");
  const leading = upcoming[0] ?? catalogue[0] ?? null;

  const requestedDate = readFilterParams(params).date;
  const dateISO =
    requestedDate && isValidCalendarDate(requestedDate) ? requestedDate : clock.todayISO;

  const summary = snapshot.scheduleAvailable
    ? summariseSchedule(snapshot.showtimes, venue.timezone, clock.todayISO)
    : null;

  /* Only true, useful statements: the venue, where it is, and what is listed. */
  const marqueeItems = [
    siteConfig.brandName,
    place || "Bihar",
    `${catalogue.length} film${catalogue.length === 1 ? "" : "s"} listed`,
    leading?.releaseDate ? `Next release ${formatDateLong(leading.releaseDate)}` : null,
    snapshot.scheduleAvailable ? null : "Screening times not connected yet",
  ].filter((item): item is string => Boolean(item));

  return (
    <>
      <Hero
        todayISO={clock.todayISO}
        place={place}
        leadingFilmSlug={leading?.slug ?? null}
        leadingFilmTitle={leading?.title ?? null}
        upcomingCount={upcoming.length}
      />

      <MarqueeTicker
        items={marqueeItems}
        label={`${siteConfig.brandName}, ${place || "Bihar"}. ${catalogue.length} films in the programme.`}
      />

      <Showcase />

      <section className="scene-pad sceneAlt" id="programme" tabIndex={-1}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">What is on</span>
              <h2>The film programme</h2>
              <p>
                Films in cinemas and announced for release, with the date each one opens. This is
                the national release calendar, sourced and cited — the cinema&rsquo;s own times are
                a separate question, answered below.
              </p>
            </div>
          </div>

          <ProgrammeBoard
            movies={preview}
            caveat={
              programme
                ? `Release dates are sourced and cited; they are not this cinema's schedule. Showing ${preview.length} of ${catalogue.length} films.`
                : null
            }
            citations={programme?.citations ?? []}
            showCitations={programme !== null}
          />

          {programme ? (
            <div className={programmeStyles.more}>
              <ProgrammeFooterLink count={catalogue.length} />
            </div>
          ) : null}
        </div>
      </section>

      <section className="scene-pad" id="showtimes" tabIndex={-1}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">When you can see them</span>
              <h2>Showtimes</h2>
              {snapshot.scheduleAvailable ? (
                <p>
                  Times, screens and formats supplied by the venue&rsquo;s own ticketing feed. Pick a
                  day, then a screening.
                </p>
              ) : (
                <p>
                  Screening times are the venue&rsquo;s own operational data, and this site publishes
                  them only from the venue&rsquo;s ticketing feed.
                </p>
              )}
            </div>
          </div>

          {snapshot.scheduleAvailable ? (
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
          ) : (
            <ScheduleWait variant="home" />
          )}

          {summary && summary.lastDateLabel ? (
            <p className="small muted" style={{ marginTop: "0.9rem" }}>
              Listings run to {summary.lastDateLabel}.
            </p>
          ) : null}
        </div>
      </section>

      <CinemaExperience />
      <VenueInfo />
    </>
  );
}
