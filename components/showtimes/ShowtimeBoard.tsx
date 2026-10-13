import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { DateSelector } from "@/components/showtimes/DateSelector";
import { ShowtimeGroup } from "@/components/showtimes/ShowtimeGroup";
import { ScheduleStatus } from "@/components/showtimes/ScheduleStatus";
import { bookableDates } from "@/lib/schedule";
import { buildHref, type FilterParams } from "@/lib/share-url";
import { buildDateOptions, buildMovieGroups, summariseSchedule } from "@/lib/showtime-view";
import { formatDateLong } from "@/lib/date-format";
import type { ScheduleSnapshot } from "@/lib/schedule-source";
import type { Movie, Venue } from "@/lib/types";
import styles from "./showtimes.module.css";

/**
 * The date-and-showtime chooser.
 *
 * Composed from a validated snapshot so every state is explicit: live or sample
 * data, a selected date with screenings, a selected date without any, and a
 * schedule that could not be read at all. There is no fourth "loading" state to
 * fake — the pages are server-rendered.
 */
export function ShowtimeBoard({
  snapshot,
  movies,
  venue,
  dateISO,
  todayISO,
  nowISO,
  basePath,
  filters,
  onlySlug,
  showPosters = true,
  headingLevel = 3,
}: {
  snapshot: ScheduleSnapshot;
  movies: Movie[];
  venue: Venue;
  dateISO: string;
  /** Today in the venue's timezone. Anchors the bookable window and labels. */
  todayISO: string;
  nowISO: string;
  basePath: string;
  filters: FilterParams;
  /** Narrows the board to one film (used on the film detail page). */
  onlySlug?: string;
  showPosters?: boolean;
  headingLevel?: 2 | 3;
}) {
  if (snapshot.state === "unavailable") {
    return (
      <div className={styles.unavailable}>
        <EmptyState
          title="We cannot show times right now"
          headingLevel={headingLevel === 2 ? 2 : 3}
          action={
            <Button href="/help" variant="outline" size="small">
              What to do next
            </Button>
          }
        >
          <p>
            We could not read the cinema&rsquo;s schedule, so there are no times to show. This is a
            problem at our end. Tickets are not affected — nothing has been booked or charged here.
          </p>
        </EmptyState>
      </div>
    );
  }

  const { showtimes, lastUpdated, sourceLabel, notice } = snapshot;

  // The bookable window is anchored to today, not to the selected date, so a
  // visitor who jumps ahead does not silently lose the earlier days.
  const dates = bookableDates(showtimes, venue.timezone, todayISO);
  const options = buildDateOptions(dates, showtimes, venue.timezone, todayISO);
  const groups = buildMovieGroups({
    schedule: showtimes,
    movies,
    venue,
    dateISO,
    nowISO,
    onlySlug,
  });

  const summary = summariseSchedule(showtimes, venue.timezone, todayISO);
  const alternativeDate = options.find((option) => option.hasShowtimes && option.dateISO !== dateISO);

  return (
    <div>
      <ScheduleStatus
        lastUpdated={lastUpdated}
        sourceLabel={sourceLabel}
        notice={notice}
        nowISO={nowISO}
      />

      <DateSelector options={options} selected={dateISO} basePath={basePath} filters={filters} />

      {groups.length === 0 ? (
        <EmptyState
          title={`No screenings listed for ${formatDateLong(dateISO)}`}
          headingLevel={headingLevel === 2 ? 2 : 3}
          action={
            alternativeDate ? (
              <Button
                href={buildHref(basePath, { ...filters, date: alternativeDate.dateISO })}
                variant="outline"
                size="small"
              >
                Go to {alternativeDate.weekday} {alternativeDate.day} {alternativeDate.month}
              </Button>
            ) : (
              <Button href="/help" variant="outline" size="small">
                Help with showtimes
              </Button>
            )
          }
        >
          <p>
            The published programme has no screenings on that date
            {summary.lastDateLongLabel ? `, and this schedule is published up to ${summary.lastDateLongLabel}` : ""}.
            We will not guess at times that were not published: choose another date above, or check
            back once the next programme is released.
          </p>
        </EmptyState>
      ) : (
        <>
          <p className={styles.policyLine} style={{ marginBottom: "0.85rem" }}>
            {groups.length} film{groups.length === 1 ? "" : "s"} · {summary.totalScreenings} screenings
            listed
            {summary.lastDateLabel ? ` through to ${summary.lastDateLabel}` : ""}.
          </p>

          <div className={styles.groups}>
            {groups.map((group) => (
              <ShowtimeGroup
                key={group.movie.slug}
                group={group}
                showPoster={showPosters}
                headingLevel={headingLevel}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
