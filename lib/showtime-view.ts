/**
 * View models for screenings and dates.
 *
 * All display strings are produced here, on the server, exactly once. Two
 * reasons:

 *   1. The components stay presentational and testable.
 *   2. Nothing is formatted from the current clock inside a client component,
 *      so server and client markup can never disagree (no hydration mismatch),
 *      and a visitor in another timezone still reads the venue's local times.
 *
 * Pure functions only: each takes `nowISO` explicitly rather than reading the
 * clock, so a snapshot can be replayed and checked.
 */

import {
  calendarDateInZone,
  dayOfMonth,
  formatDateAccessible,
  formatDateLong,
  formatPrice,
  formatRuntime,
  formatTime,
  monthShort,
  relativeDayLabel,
  weekdayShort,
} from "@/lib/date-format";
import { groupByScreen, showtimesOnDate, sortByStart } from "@/lib/schedule";
import { resolveBookingHandoff, type BookingHandoff } from "@/lib/ticketing-provider";
import type { Availability, Format, Movie, Showtime, Venue } from "@/lib/types";

export type BadgeTone = "neutral" | "amber" | "accent" | "ok" | "plain";

/**
 * Availability is only ever shown when the provider supplied it. "unknown" is
 * not rendered as a guess — the section states the policy in words instead.
 */
const AVAILABILITY_VIEW: Record<Availability, { label: string | null; tone: BadgeTone }> = {
  unknown: { label: null, tone: "plain" },
  available: { label: "Bookable", tone: "ok" },
  few_left: { label: "Few seats left", tone: "amber" },
  sold_out: { label: "Sold out", tone: "accent" },
};

export type DateOption = {
  dateISO: string;
  weekday: string;
  day: string;
  month: string;
  /** "Today" / "Tomorrow" / null. */
  relativeLabel: string | null;
  /** Full date plus relative day, for assistive technology. */
  ariaLabel: string;
  /** How many screenings are on this date. */
  count: number;
  hasShowtimes: boolean;
};

export function buildDateOptions(
  dates: string[],
  schedule: Showtime[],
  timeZone: string,
  todayISO: string,
): DateOption[] {
  const countsByDate = new Map<string, number>();
  for (const showtime of schedule) {
    const dateISO = calendarDateInZone(new Date(showtime.startsAt), timeZone);
    countsByDate.set(dateISO, (countsByDate.get(dateISO) ?? 0) + 1);
  }

  return dates.map((dateISO) => {
    const count = countsByDate.get(dateISO) ?? 0;
    return {
      dateISO,
      weekday: weekdayShort(dateISO),
      day: dayOfMonth(dateISO),
      month: monthShort(dateISO),
      relativeLabel: relativeDayLabel(dateISO, todayISO),
      ariaLabel: formatDateAccessible(dateISO, todayISO),
      count,
      hasShowtimes: count > 0,
    };
  });
}

export type ShowtimeView = {
  id: string;
  /** "6:15 pm" — venue-local clock time. */
  timeLabel: string;
  startsAt: string;
  format: Format;
  languageLabel: string;
  screenName: string;
  availabilityLabel: string | null;
  availabilityTone: BadgeTone;
  priceLabel: string | null;
  /** True once the screening's start time has passed. */
  hasStarted: boolean;
  booking: BookingHandoff;
};

export type MovieGroupView = {
  movie: Movie;
  href: string;
  /** "1h 46m" or null when the source does not state a runtime. */
  runtimeLabel: string | null;
  /** "U/A 13+ (CBFC)" or null when uncertified/unknown. */
  certificationLabel: string | null;
  languageLabels: string[];
  /** Screens offering this film on the selected date. */
  screens: {
    screenId: string;
    screenName: string;
    formats: Format[];
    showtimes: ShowtimeView[];
  }[];
  totalShowtimes: number;
};

function buildShowtimeView(
  showtime: Showtime,
  movie: Movie,
  venue: Venue,
  languageLabels: (code: string) => string,
  timeZone: string,
  nowISO: string,
): ShowtimeView {
  const screen = venue.screens.find((entry) => entry.id === showtime.screenId);
  const availability = AVAILABILITY_VIEW[showtime.availability];
  const hasStarted = Date.parse(showtime.startsAt) < Date.parse(nowISO);

  /**
   * Sold-out and already-started screenings do not get a booking handoff: the
   * first would send people to a provider page they cannot complete, and the
   * second is not a purchase anyone can make.
   */
  const booking: BookingHandoff =
    showtime.availability === "sold_out"
      ? {
          kind: "unavailable",
          reason: "no-provider",
          title: "Sold out",
          detail:
            "The ticketing partner reports no remaining seats for this screening. Other times for this film are listed on this page.",
        }
      : hasStarted
        ? {
            kind: "unavailable",
            reason: "no-provider",
            title: "This screening has started",
            detail: "Choose a later screening, or another date.",
          }
        : resolveBookingHandoff({
            movieSlug: movie.slug,
            venueId: venue.id,
            showtime,
            timezone: venue.timezone,
          });

  return {
    id: showtime.id,
    timeLabel: formatTime(showtime.startsAt, timeZone),
    startsAt: showtime.startsAt,
    format: showtime.format,
    languageLabel: languageLabels(showtime.languageCode),
    screenName: screen?.name ?? "Screen to be confirmed",
    availabilityLabel: availability.label,
    availabilityTone: availability.tone,
    priceLabel: formatPrice(showtime.priceMinor, showtime.currency),
    hasStarted,
    booking,
  };
}

/**
 * Groups one date's screenings by film, then by screen. `onlySlug` narrows the
 * result to a single film, which is what the film detail page needs.
 */
export function buildMovieGroups({
  schedule,
  movies,
  venue,
  dateISO,
  nowISO,
  onlySlug,
}: {
  schedule: Showtime[];
  movies: Movie[];
  venue: Venue;
  dateISO: string;
  nowISO: string;
  onlySlug?: string;
}): MovieGroupView[] {
  const forDate = showtimesOnDate(schedule, dateISO, venue.timezone);
  const languageLabels = (code: string) => {
    for (const movie of movies) {
      const match = movie.languages.find((language) => language.code === code);
      if (match) return match.label;
    }
    return code.toUpperCase();
  };

  const catalogue = onlySlug ? movies.filter((movie) => movie.slug === onlySlug) : movies;

  const groups: MovieGroupView[] = [];

  for (const movie of catalogue) {
    const movieShowtimes = forDate.filter((showtime) => showtime.movieSlug === movie.slug);
    if (movieShowtimes.length === 0) continue;

    const views = movieShowtimes
      .map((showtime) =>
        buildShowtimeView(showtime, movie, venue, languageLabels, venue.timezone, nowISO),
      )
      .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));

    const screenGroups = groupByScreen(movieShowtimes, venue.screens).map((group) => ({
      screenId: group.screen.id,
      screenName: group.screen.name,
      formats: [...new Set(group.showtimes.map((showtime) => showtime.format))],
      showtimes: views.filter((view) =>
        group.showtimes.some((showtime) => showtime.id === view.id),
      ),
    }));

    groups.push({
      movie,
      href: `/movies/${movie.slug}`,
      runtimeLabel: formatRuntime(movie.runtimeMinutes),
      certificationLabel: movie.certification
        ? `${movie.certification.label} (${movie.certification.body})`
        : null,
      languageLabels: [...new Set(movieShowtimes.map((showtime) => languageLabels(showtime.languageCode)))],
      screens: screenGroups,
      totalShowtimes: views.length,
    });
  }

  return groups;
}

export type ScheduleSummary = {
  totalScreenings: number;
  screeningsToday: number;
  firstDate: string | null;
  lastDate: string | null;
  /** "Tue 13 Oct" style label for the last date in the window. */
  lastDateLabel: string | null;
  lastDateLongLabel: string | null;
};

export function summariseSchedule(
  schedule: Showtime[],
  timeZone: string,
  todayISO: string,
): ScheduleSummary {
  const dates = [...new Set(schedule.map((showtime) => calendarDateInZone(new Date(showtime.startsAt), timeZone)))]
    .filter((dateISO) => dateISO >= todayISO)
    .sort();

  const firstDate = dates[0] ?? null;
  const lastDate = dates[dates.length - 1] ?? null;

  return {
    totalScreenings: schedule.filter(
      (showtime) => calendarDateInZone(new Date(showtime.startsAt), timeZone) >= todayISO,
    ).length,
    screeningsToday: schedule.filter(
      (showtime) => calendarDateInZone(new Date(showtime.startsAt), timeZone) === todayISO,
    ).length,
    firstDate,
    lastDate,
    lastDateLabel: lastDate ? `${weekdayShort(lastDate)} ${dayOfMonth(lastDate)} ${monthShort(lastDate)}` : null,
    lastDateLongLabel: lastDate ? formatDateLong(lastDate) : null,
  };
}

/** Films with at least one upcoming screening, in catalogue order. */
export function filmsWithUpcomingScreenings(schedule: Showtime[], movies: Movie[], nowISO: string): Movie[] {
  const upcoming = new Set(
    schedule.filter((showtime) => Date.parse(showtime.startsAt) >= Date.parse(nowISO)).map((showtime) => showtime.movieSlug),
  );
  return movies.filter((movie) => upcoming.has(movie.slug));
}

/** The next screening per film, ready to render on a poster card. */
export function nextScreeningByFilm(
  schedule: Showtime[],
  timeZone: string,
  todayISO: string,
  nowISO: string,
): Map<string, { timeLabel: string; relative: string | null; dateLabel: string; dateISO: string }> {
  const result = new Map<
    string,
    { timeLabel: string; relative: string | null; dateLabel: string; dateISO: string }
  >();

  for (const showtime of [...schedule].sort(sortByStart)) {
    if (Date.parse(showtime.startsAt) < Date.parse(nowISO)) continue;
    if (result.has(showtime.movieSlug)) continue;

    const dateISO = calendarDateInZone(new Date(showtime.startsAt), timeZone);
    result.set(showtime.movieSlug, {
      timeLabel: formatTime(showtime.startsAt, timeZone),
      relative: relativeDayLabel(dateISO, todayISO),
      dateLabel: `${weekdayShort(dateISO)} ${dayOfMonth(dateISO)} ${monthShort(dateISO)}`,
      dateISO,
    });
  }

  return result;
}
