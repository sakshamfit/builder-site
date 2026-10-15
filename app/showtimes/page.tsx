import type { Metadata } from "next";
import { ScheduleWait } from "@/components/programme/ScheduleWait";
import { SampleSchedule } from "@/components/showtimes/SampleSchedule";
import { ScheduleStatus } from "@/components/showtimes/ScheduleStatus";
import { ShowtimeBoard } from "@/components/showtimes/ShowtimeBoard";
import { readClock } from "@/lib/clock";
import { buildMetadata } from "@/lib/metadata";
import { SAMPLE_CONTENT_ENABLED } from "@/lib/sample-content";
import { getScheduleSnapshot } from "@/lib/schedule-source";
import { readFilterParams } from "@/lib/share-url";

export const metadata: Metadata = buildMetadata({
  title: "Showtimes",
  description:
    "Today's screenings and the days after, with screens, formats and prices, published only from the venue's own ticketing feed.",
  path: "/showtimes",
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Showtimes.
 *
 * Three honest states, and no fourth:
 *
 *   live    — the venue's feed is connected and readable: the real board, with
 *             the source and its freshness stated above it;
 *   sample  — no feed, but the design's sample screening is available: the
 *             sample day, marked as sample, leading to the sample screening
 *             screen;
 *   waiting — no feed and sample content switched off: the plain statement that
 *             screening times come from the venue's own system and are not
 *             connected yet.
 */
export default async function ShowtimesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const clock = readClock();
  const snapshot = await getScheduleSnapshot();
  const filters = readFilterParams(params);
  const dateISO = filters.date ?? clock.todayISO;

  const live = snapshot.state === "ready" && snapshot.scheduleAvailable;

  return (
    <>
      <section className="scene-pad">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">When you can see them</span>
              <h1>Showtimes</h1>
              <p>
                {live
                  ? "Times, screens and formats supplied by the venue's own ticketing feed. Pick a day, then a screening."
                  : "Screening times are the venue's own operational data, and this site publishes them only from the venue's ticketing feed."}
              </p>
            </div>
          </div>

          {live && snapshot.state === "ready" ? (
            <>
              <ScheduleStatus
                lastUpdated={snapshot.lastUpdated}
                sourceLabel={snapshot.sourceLabel}
                notice={snapshot.notice}
                nowISO={clock.nowISO}
              />
              <ShowtimeBoard
                snapshot={snapshot}
                movies={snapshot.catalogue}
                venue={snapshot.venue}
                dateISO={dateISO}
                todayISO={clock.todayISO}
                nowISO={clock.nowISO}
                basePath="/showtimes"
                filters={filters}
                headingLevel={2}
              />
            </>
          ) : SAMPLE_CONTENT_ENABLED ? (
            <SampleSchedule />
          ) : (
            <ScheduleWait
              variant="page"
              title="Showtimes for this cinema"
              reason={snapshot.state === "unavailable" ? snapshot.reason : null}
            />
          )}
        </div>
      </section>
    </>
  );
}
