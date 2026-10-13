/**
 * Date and time helpers.
 *
 * The venue operates in one timezone (Asia/Kolkata by default) while the
 * visitor's device may be in another. Every function here is explicit about
 * which zone it works in, and every formatter takes its input as a parameter —
 * nothing reads the clock implicitly. That keeps server and client output
 * identical and avoids hydration mismatches.
 */

/** ISO 8601 with an explicit UTC offset (`Z` or `±HH:MM`). */
export const ISO_WITH_OFFSET_RE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

/** Calendar date with no time component, e.g. "2026-10-13". */
export const CALENDAR_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidCalendarDate(value: string): boolean {
  if (!CALENDAR_DATE_RE.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const probe = new Date(Date.UTC(year, month - 1, day));
  return (
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === day
  );
}

export function isValidIsoWithOffset(value: string): boolean {
  return ISO_WITH_OFFSET_RE.test(value) && !Number.isNaN(Date.parse(value));
}

/**
 * A calendar date as a Date at midday UTC. Midday (rather than midnight) so
 * that formatting it in any zone still lands on the intended calendar day.
 */
function calendarDateAtNoonUtc(dateISO: string): Date {
  const [year, month, day] = dateISO.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** The calendar date that `instant` falls on, as observed in `timeZone`. */
export function calendarDateInZone(instant: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${pick("year")}-${pick("month")}-${pick("day")}`;
}

/** Today's calendar date as observed in the venue's timezone. */
export function todayInZone(timeZone: string, now: Date = new Date()): string {
  return calendarDateInZone(now, timeZone);
}

/** Pure calendar arithmetic on "YYYY-MM-DD" strings. */
export function addDays(dateISO: string, days: number): string {
  if (!isValidCalendarDate(dateISO)) {
    throw new Error(`addDays received an invalid calendar date: ${dateISO}`);
  }
  const base = calendarDateAtNoonUtc(dateISO).getTime();
  const next = new Date(base + days * 86_400_000);
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
}

/** Whole days from `fromISO` to `toISO` (negative when `toISO` is earlier). */
export function diffInDays(fromISO: string, toISO: string): number {
  const a = calendarDateAtNoonUtc(fromISO).getTime();
  const b = calendarDateAtNoonUtc(toISO).getTime();
  return Math.round((b - a) / 86_400_000);
}

function formatInZone(
  value: Date | string,
  options: Intl.DateTimeFormatOptions,
  timeZone: string,
  locale = "en-IN",
): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, { ...options, timeZone }).format(date);
}

/** "6:15 pm" — the venue-local clock time of a showtime. */
export function formatTime(instantISO: string, timeZone: string): string {
  return formatInZone(instantISO, { hour: "numeric", minute: "2-digit", hour12: true }, timeZone)
    .replace(/\s?(AM|PM)$/i, (match) => match.toLowerCase())
    .replace(/\u202f|\u00a0/g, " ");
}

/** "Tue" */
export function weekdayShort(dateISO: string): string {
  return formatInZone(calendarDateAtNoonUtc(dateISO), { weekday: "short" }, "UTC");
}

/** "13" */
export function dayOfMonth(dateISO: string): string {
  return formatInZone(calendarDateAtNoonUtc(dateISO), { day: "numeric" }, "UTC");
}

/** "Oct" */
export function monthShort(dateISO: string): string {
  return formatInZone(calendarDateAtNoonUtc(dateISO), { month: "short" }, "UTC");
}

/** "Tuesday, 13 October 2026" */
export function formatDateLong(dateISO: string): string {
  return formatInZone(
    calendarDateAtNoonUtc(dateISO),
    { weekday: "long", day: "numeric", month: "long", year: "numeric" },
    "UTC",
  );
}

/** "Tue 13 Oct" — used on compact date chips. */
export function formatDateShort(dateISO: string): string {
  return formatInZone(
    calendarDateAtNoonUtc(dateISO),
    { weekday: "short", day: "numeric", month: "short" },
    "UTC",
  );
}

/**
 * Accessible, unambiguous label for a date button — screen readers get the
 * full date rather than a bare number.
 */
export function formatDateAccessible(dateISO: string, todayISO: string): string {
  const offset = diffInDays(todayISO, dateISO);
  const base = formatDateLong(dateISO);
  if (offset === 0) return `${base}, today`;
  if (offset === 1) return `${base}, tomorrow`;
  return base;
}

/** "Today" / "Tomorrow" / null — only for dates in the venue's own calendar. */
export function relativeDayLabel(dateISO: string, todayISO: string): string | null {
  const offset = diffInDays(todayISO, dateISO);
  if (offset === 0) return "Today";
  if (offset === 1) return "Tomorrow";
  return null;
}

/** "2h 12m" */
export function formatRuntime(minutes: number | null): string | null {
  if (minutes === null || !Number.isFinite(minutes) || minutes <= 0) return null;
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  if (hours === 0) return `${rest}m`;
  if (rest === 0) return `${hours}h`;
  return `${hours}h ${rest}m`;
}

/**
 * Prices are handled in minor units so money never touches floating point.
 * Returns null for anything that is not a plain, finite, non-negative number —
 * we would rather show nothing than an invented ticket price.
 */
export function formatPrice(minor: number | null, currency: string | null): string | null {
  if (minor === null || currency === null) return null;
  if (!Number.isFinite(minor) || minor < 0) return null;
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(minor / 100);
  } catch {
    return null;
  }
}

/**
 * How old a schedule snapshot is, relative to a caller-supplied "now" so the
 * result is deterministic between server and client.
 */
export function scheduleFreshness(
  lastUpdatedISO: string,
  nowISO: string,
): { level: "current" | "aging" | "stale"; hours: number } {
  const updated = Date.parse(lastUpdatedISO);
  const now = Date.parse(nowISO);
  if (Number.isNaN(updated) || Number.isNaN(now)) {
    return { level: "stale", hours: Number.POSITIVE_INFINITY };
  }
  const hours = (now - updated) / 3_600_000;
  if (hours < 6) return { level: "current", hours };
  if (hours < 24) return { level: "aging", hours };
  return { level: "stale", hours };
}

/**
 * Offset string for a wall-clock time in a zone, e.g. "+05:30".
 *
 * Computed through Intl rather than hardcoded, so anything generating ISO
 * timestamps stays correct if the venue timezone is configured differently.
 * Moved here from the deleted fixture generator, which needed it to build sample
 * screenings; the test harness that builds stand-in feed payloads still does.
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
