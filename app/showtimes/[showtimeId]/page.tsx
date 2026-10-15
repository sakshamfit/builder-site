import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HandoffScreen } from "@/components/showtimes/HandoffScreen";
import { readClock } from "@/lib/clock";
import { buildMetadata } from "@/lib/metadata";
import { placeLabel } from "@/lib/cinema-content";
import { SAMPLE_CONTENT_ENABLED } from "@/lib/sample-content";
import { fromLiveShowtime, fromSampleScreening } from "@/lib/screening-detail";
import { getScheduleSnapshot } from "@/lib/schedule-source";
import { buildMovieGroups } from "@/lib/showtime-view";
import { formatDateLong, formatTime, relativeDayLabel, scheduleFreshness } from "@/lib/date-format";

export const metadata: Metadata = buildMetadata({
  title: "Screening",
  description:
    "One screening: the auditorium, the format, the price range, and the handoff to the venue's ticketing partner.",
  path: "/showtimes",
});

/** Resolves the sample screening at build time; real ids come from the feed. */
export function generateStaticParams() {
  return SAMPLE_CONTENT_ENABLED ? [{ showtimeId: "sample" }] : [];
}

function doorsLabel(startsAt: string, minutes: number): string {
  const doors = new Date(Date.parse(startsAt) - minutes * 60_000).toISOString();
  return `Doors open at ${formatTime(doors, "Asia/Kolkata").replace(/\s?([ap])m$/, " $1m")}`;
}

/**
 * One screening.
 *
 * The sample screening and a real one render the same screen, because they are
 * the same design: what differs is where the values came from, and whether the
 * ticket action leads anywhere. A sample screening says it is a sample; a real
 * one states its source and its freshness; and neither invents an availability
 * state, a price or a seat count that nobody supplied.
 */
export default async function ScreeningPage({
  params,
}: {
  params: Promise<{ showtimeId: string }>;
}) {
  const { showtimeId } = await params;
  const clock = readClock();
  const venueLine = [placeLabel(), "India"].filter(Boolean).join(" · ");

  if (showtimeId === "sample") {
    if (!SAMPLE_CONTENT_ENABLED) notFound();
    return <HandoffScreen detail={fromSampleScreening(venueLine)} />;
  }

  const snapshot = await getScheduleSnapshot();
  if (snapshot.state !== "ready") notFound();

  const showtime = snapshot.showtimes.find((entry) => entry.id === showtimeId);
  if (!showtime) notFound();

  const movie = snapshot.catalogue.find((entry) => entry.slug === showtime.movieSlug);
  if (!movie) notFound();

  const dateISO = new Intl.DateTimeFormat("en-CA", {
    timeZone: snapshot.venue.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(showtime.startsAt));

  const group = buildMovieGroups({
    schedule: snapshot.showtimes,
    movies: [movie],
    venue: snapshot.venue,
    dateISO,
    nowISO: clock.nowISO,
  })[0];

  const view = group?.screens.flatMap((screen) => screen.showtimes).find((entry) => entry.id === showtimeId);
  if (!view) notFound();

  const dayLabel = relativeDayLabel(dateISO, clock.todayISO);
  const freshness = snapshot.lastUpdated
    ? scheduleFreshness(snapshot.lastUpdated, clock.nowISO)
    : { level: "stale" as const, hours: Number.POSITIVE_INFINITY };

  return (
    <HandoffScreen
      detail={{
        ...fromLiveShowtime({
          view,
          movieTitle: movie.title,
          movieHref: `/movies/${movie.slug}`,
          certification: group?.certificationLabel ?? null,
          runtimeLabel: group?.runtimeLabel ?? null,
          venueLine,
          auditorium: view.screenName,
          doorsLine: doorsLabel(showtime.startsAt, 20),
          dateLabel: "Show date & time",
          dateValue: `${dayLabel ? `${dayLabel}, ` : ""}${formatDateLong(dateISO)} · ${view.timeLabel}`,
          priceLabel: view.priceLabel,
        }),
        // Live provenance, stated on the screen itself.
        sampleNotice:
          freshness.level === "stale"
            ? "This timetable has not been refreshed recently. Times may have changed since — confirm with the cinema before travelling."
            : `${snapshot.sourceLabel}${snapshot.notice ? ` · ${snapshot.notice}` : ""}`,
      }}
    />
  );
}
