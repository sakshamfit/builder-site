/**
 * SAMPLE SCHEDULE — DEVELOPMENT FIXTURE. NOT A REAL PROGRAMME.
 *
 * These screenings are generated for the interface only. They do not describe
 * any real cinema, screen or film. Two consequences are enforced in code:
 *
 *   - every record is marked `source: "fixture"`, which makes
 *     lib/ticketing-provider.ts refuse to produce a booking link;
 *   - `availability` is "unknown" and `priceMinor` is null on every record,
 *     because inventing ticket prices or seat availability is exactly the kind
 *     of claim this project must never make. The UI shows a plain statement
 *     that live availability and pricing come from the ticketing partner.
 *
 * The storefront slots for price and availability are implemented and will
 * render as soon as a validated live feed supplies them — see README "Data".
 *
 * Generated relative to the day the server starts, so a fresh clone always has
 * something to show for the coming week.
 */

import { addDays, todayInZone } from "@/lib/date-format";
import { venue } from "@/data/cinema";
import type { Format, Showtime } from "@/lib/types";

const FIXTURE_TIMEZONE = venue.timezone;

/** Number of days the sample schedule covers, starting today. */
export const FIXTURE_WINDOW_DAYS = 7;

/** The venue-local calendar date this fixture window starts on. */
export const FIXTURE_ANCHOR_DATE: string = todayInZone(FIXTURE_TIMEZONE);

/**
 * When the sample schedule was generated. Displayed to the visitor next to the
 * real "last updated" slot so the freshness treatment is exercised.
 */
export const FIXTURE_LAST_UPDATED: string = new Date().toISOString();

/**
 * Offset string for a wall-clock time in a zone, e.g. "+05:30".
 *
 * Computed through Intl rather than hardcoded, so the fixture generator stays
 * correct if the venue timezone is ever configured differently.
 */
export function zoneOffsetString(dateISO: string, time: string, timeZone: string): string {
  const naive = new Date(`${dateISO}T${time}:00Z`);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(naive);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  const wallClock = Date.UTC(
    read("year"),
    read("month") - 1,
    read("day"),
    read("hour"),
    read("minute"),
    read("second"),
  );
  const offsetMinutes = Math.round((wallClock - naive.getTime()) / 60_000);
  const sign = offsetMinutes < 0 ? "-" : "+";
  const absolute = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absolute / 60)).padStart(2, "0");
  const minutes = String(absolute % 60).padStart(2, "0");
  return `${sign}${hours}:${minutes}`;
}

type FixturePlan = {
  slug: string;
  languageCode: string;
  format: Format;
  screenId: string;
  /** Venue-local wall-clock start times, 24h "HH:MM". */
  weekdayTimes: string[];
  weekendTimes: string[];
};

/**
 * One entry per film/screen/format combination. A film appears more than once
 * when it plays in more than one format.
 */
const PLANS: FixturePlan[] = [
  {
    slug: "lantern-keeper",
    languageCode: "hi",
    format: "2D",
    screenId: "screen-1",
    weekdayTimes: ["11:10", "14:20", "17:30", "20:40"],
    weekendTimes: ["10:20", "13:30", "16:40", "19:50", "23:00"],
  },
  {
    slug: "monsoon-circuit",
    languageCode: "hi",
    format: "2D",
    screenId: "screen-2",
    weekdayTimes: ["12:00", "15:15", "18:30", "21:45"],
    weekendTimes: ["10:45", "14:00", "17:15", "20:30", "23:20"],
  },
  {
    slug: "nightshift-at-zero",
    languageCode: "en",
    format: "2D",
    screenId: "screen-3",
    weekdayTimes: ["13:05", "16:20", "19:35", "22:45"],
    weekendTimes: ["11:50", "15:05", "18:20", "21:35"],
  },
  {
    slug: "nightshift-at-zero",
    languageCode: "en",
    format: "3D",
    screenId: "screen-4",
    weekdayTimes: ["18:00", "21:10"],
    weekendTimes: ["12:40", "15:55", "19:10", "22:20"],
  },
  {
    slug: "paper-boats",
    languageCode: "pa",
    format: "2D",
    screenId: "screen-1",
    weekdayTimes: ["10:30", "13:15", "16:00", "18:45"],
    weekendTimes: ["09:55", "12:40", "15:25", "18:10", "20:55"],
  },
  {
    slug: "quiet-orbit",
    languageCode: "en",
    format: "2D",
    screenId: "screen-2",
    weekdayTimes: ["11:30", "15:00", "18:30", "22:00"],
    weekendTimes: ["10:15", "13:45", "17:15", "20:45"],
  },
  {
    slug: "harbour-lights",
    languageCode: "hi",
    format: "2D",
    screenId: "screen-3",
    weekdayTimes: ["12:30", "15:45", "19:00", "22:15"],
    weekendTimes: ["11:20", "14:35", "17:50", "21:05"],
  },
];

function isWeekend(dateISO: string): boolean {
  const [year, month, day] = dateISO.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return weekday === 0 || weekday === 6;
}

function buildFixtureShowtimes(): Showtime[] {
  const showtimes: Showtime[] = [];
  const offset = zoneOffsetString(FIXTURE_ANCHOR_DATE, "12:00", FIXTURE_TIMEZONE);

  for (let dayIndex = 0; dayIndex < FIXTURE_WINDOW_DAYS; dayIndex += 1) {
    const dateISO = addDays(FIXTURE_ANCHOR_DATE, dayIndex);
    const weekend = isWeekend(dateISO);

    for (const plan of PLANS) {
      const times = weekend ? plan.weekendTimes : plan.weekdayTimes;
      for (const time of times) {
        showtimes.push({
          id: `${plan.slug}-${dateISO.replace(/-/g, "")}-${plan.screenId}-${time.replace(":", "")}`,
          movieSlug: plan.slug,
          venueId: venue.id,
          screenId: plan.screenId,
          startsAt: `${dateISO}T${time}:00${offset}`,
          timezone: FIXTURE_TIMEZONE,
          languageCode: plan.languageCode,
          format: plan.format,
          // Never guessed: real availability and pricing arrive with the feed.
          availability: "unknown",
          priceMinor: null,
          currency: null,
          providerShowtimeId: null,
          source: "fixture",
          provenance: "Sample schedule generated for local development",
        });
      }
    }
  }

  return showtimes;
}

export const fixtureShowtimes: Showtime[] = buildFixtureShowtimes();

/** Shown in the UI wherever fixture screenings are listed. */
export const FIXTURE_NOTICE =
  "Sample schedule for development. These are not real screenings, no ticket can be bought from them, and they are replaced by the venue's live schedule before launch.";
