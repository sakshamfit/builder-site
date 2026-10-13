/**
 * Schedule validation and derivation.
 *
 * Any schedule — fixture or live operator feed — passes through here before a
 * single showtime reaches the UI. Invalid records are dropped and reported
 * rather than rendered, so a broken feed degrades into an honest "no times
 * available" state instead of wrong times on screen.
 */

import {
  addDays,
  calendarDateInZone,
  isValidCalendarDate,
  isValidIsoWithOffset,
} from "@/lib/date-format";
import type { Availability, Format, Movie, Showtime, Venue } from "@/lib/types";

const FORMATS: readonly Format[] = ["2D", "3D", "IMAX", "4DX", "ScreenX", "Dolby Atmos"];
const AVAILABILITY: readonly Availability[] = ["unknown", "available", "few_left", "sold_out"];

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: string[] };

export type ScheduleHealth = {
  /** Records that passed validation and may be rendered. */
  valid: Showtime[];
  /** Records that were rejected, with the reason, for build/CI reporting. */
  rejected: { record: unknown; errors: string[] }[];
  /** Non-fatal notes, e.g. a showtime for a film that is not in the catalogue. */
  warnings: string[];
};

/**
 * Validates one raw showtime record. Deliberately strict: an unknown field
 * value is an error, not something to coerce, because coercing a format or an
 * availability state is how a site ends up claiming something untrue.
 */
export function validateShowtime(raw: unknown): ValidationResult<Showtime> {
  const errors: string[] = [];

  if (typeof raw !== "object" || raw === null) {
    return { ok: false, errors: ["record is not an object"] };
  }
  const record = raw as Record<string, unknown>;

  const requireString = (key: string): string | null => {
    const value = record[key];
    if (typeof value !== "string" || value.trim() === "") {
      errors.push(`"${key}" must be a non-empty string`);
      return null;
    }
    return value;
  };

  const id = requireString("id");
  const movieSlug = requireString("movieSlug");
  const venueId = requireString("venueId");
  const screenId = requireString("screenId");
  const startsAt = requireString("startsAt");
  const timezone = requireString("timezone");
  const languageCode = requireString("languageCode");
  const provenance = requireString("provenance");

  if (startsAt && !isValidIsoWithOffset(startsAt)) {
    errors.push(`"startsAt" must be ISO 8601 with an explicit offset, got "${startsAt}"`);
  }

  const format = record.format;
  if (typeof format !== "string" || !FORMATS.includes(format as Format)) {
    errors.push(`"format" must be one of ${FORMATS.join(", ")}`);
  }

  const availability = record.availability;
  if (typeof availability !== "string" || !AVAILABILITY.includes(availability as Availability)) {
    errors.push(`"availability" must be one of ${AVAILABILITY.join(", ")}`);
  }

  const priceMinor = record.priceMinor;
  if (priceMinor !== null && (typeof priceMinor !== "number" || !Number.isFinite(priceMinor) || priceMinor < 0)) {
    errors.push('"priceMinor" must be null or a non-negative number');
  }

  const currency = record.currency;
  if (currency !== null && typeof currency !== "string") {
    errors.push('"currency" must be null or a string');
  }
  if (priceMinor !== null && typeof priceMinor === "number" && !currency) {
    errors.push("a price was supplied without a currency");
  }

  const source = record.source;
  if (source !== "fixture" && source !== "live") {
    errors.push('"source" must be "fixture" or "live"');
  }

  const providerShowtimeId = record.providerShowtimeId;
  if (providerShowtimeId !== null && typeof providerShowtimeId !== "string") {
    errors.push('"providerShowtimeId" must be null or a string');
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      id: id as string,
      movieSlug: movieSlug as string,
      venueId: venueId as string,
      screenId: screenId as string,
      startsAt: startsAt as string,
      timezone: timezone as string,
      languageCode: languageCode as string,
      format: format as Format,
      availability: availability as Availability,
      priceMinor: (priceMinor as number | null) ?? null,
      currency: (currency as string | null) ?? null,
      providerShowtimeId: (providerShowtimeId as string | null) ?? null,
      source: source as "fixture" | "live",
      provenance: provenance as string,
    },
  };
}

/**
 * Validates a whole schedule against the catalogue and venue, so a showtime can
 * never point at a film or screen that does not exist.
 */
export function validateSchedule(
  records: unknown[],
  movies: Movie[],
  venue: Venue,
): ScheduleHealth {
  const valid: Showtime[] = [];
  const rejected: ScheduleHealth["rejected"] = [];
  const warnings: string[] = [];

  const movieSlugs = new Set(movies.map((movie) => movie.slug));
  const screenIds = new Set(venue.screens.map((screen) => screen.id));
  const seenIds = new Set<string>();

  for (const record of records) {
    const result = validateShowtime(record);
    if (!result.ok) {
      rejected.push({ record, errors: result.errors });
      continue;
    }

    const showtime = result.value;
    const references: string[] = [];

    if (!movieSlugs.has(showtime.movieSlug)) {
      references.push(`unknown movie "${showtime.movieSlug}"`);
    }
    if (!screenIds.has(showtime.screenId)) {
      references.push(`unknown screen "${showtime.screenId}"`);
    }
    if (showtime.venueId !== venue.id) {
      references.push(`unknown venue "${showtime.venueId}"`);
    }
    if (showtime.timezone !== venue.timezone) {
      references.push(`timezone "${showtime.timezone}" does not match the venue`);
    }
    if (seenIds.has(showtime.id)) {
      references.push(`duplicate showtime id "${showtime.id}"`);
    }

    if (references.length > 0) {
      rejected.push({ record, errors: references });
      continue;
    }

    seenIds.add(showtime.id);
    valid.push(showtime);
  }

  if (valid.length === 0) {
    warnings.push("the schedule contained no usable showtimes");
  }

  return { valid, rejected, warnings };
}

/** Earliest-first, so listings read in the order a visitor plans their day. */
export function sortByStart(a: Showtime, b: Showtime): number {
  return Date.parse(a.startsAt) - Date.parse(b.startsAt);
}

/** Showtimes for one calendar date, in the venue's timezone. */
export function showtimesOnDate(
  schedule: Showtime[],
  dateISO: string,
  timeZone: string,
): Showtime[] {
  return schedule
    .filter((showtime) => calendarDateInZone(new Date(showtime.startsAt), timeZone) === dateISO)
    .sort(sortByStart);
}

/**
 * The list of dates worth offering in the date picker: every date that
 * actually has showtimes, capped to a rolling window, plus today so the
 * selected state is always valid.
 */
export function bookableDates(
  schedule: Showtime[],
  timeZone: string,
  todayISO: string,
  windowDays = 7,
): string[] {
  const dates = new Set<string>([todayISO]);
  const lastDate = addDays(todayISO, windowDays - 1);

  for (const showtime of schedule) {
    const dateISO = calendarDateInZone(new Date(showtime.startsAt), timeZone);
    if (dateISO >= todayISO && dateISO <= lastDate) {
      dates.add(dateISO);
    }
  }

  return [...dates].sort();
}

/** Showtimes grouped by film, preserving the catalogue order of the films. */
export function groupByMovie(
  schedule: Showtime[],
  movieOrder: string[],
): { movieSlug: string; showtimes: Showtime[] }[] {
  const map = new Map<string, Showtime[]>();
  for (const showtime of schedule) {
    const list = map.get(showtime.movieSlug);
    if (list) list.push(showtime);
    else map.set(showtime.movieSlug, [showtime]);
  }
  return movieOrder
    .filter((slug) => map.has(slug))
    .map((slug) => ({ movieSlug: slug, showtimes: (map.get(slug) ?? []).sort(sortByStart) }));
}

/** Showtimes grouped by screen, for the per-film detail view. */
export function groupByScreen(
  schedule: Showtime[],
  screens: Venue["screens"],
): { screen: Venue["screens"][number]; showtimes: Showtime[] }[] {
  const byId = new Map(screens.map((screen) => [screen.id, screen]));
  const groups = new Map<string, Showtime[]>();

  for (const showtime of schedule) {
    const list = groups.get(showtime.screenId);
    if (list) list.push(showtime);
    else groups.set(showtime.screenId, [showtime]);
  }

  return [...groups.entries()]
    .map(([screenId, showtimes]) => ({
      screen: byId.get(screenId),
      showtimes: showtimes.sort(sortByStart),
    }))
    .filter(
      (group): group is { screen: Venue["screens"][number]; showtimes: Showtime[] } =>
        group.screen !== undefined,
    )
    // Earliest screening first, so the order matches the page's own timeline.
    .sort((a, b) => sortByStart(a.showtimes[0], b.showtimes[0]));
}

/** Distinct languages/formats actually present on a given date. */
export function facetsForDate(schedule: Showtime[]): {
  languages: string[];
  formats: Format[];
} {
  const languages = new Set<string>();
  const formats = new Set<Format>();
  for (const showtime of schedule) {
    languages.add(showtime.languageCode);
    formats.add(showtime.format);
  }
  return { languages: [...languages].sort(), formats: [...formats].sort() };
}

export function isValidDateFormatFilter(value: string): value is Format {
  return (FORMATS as readonly string[]).includes(value);
}

export function isUpcoming(showtime: Showtime, nowISO: string): boolean {
  const start = Date.parse(showtime.startsAt);
  const now = Date.parse(nowISO);
  if (Number.isNaN(start) || Number.isNaN(now)) return false;
  return start >= now;
}

export { isValidCalendarDate };
