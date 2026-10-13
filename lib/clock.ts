/**
 * The one place that reads the wall clock.
 *
 * Every page calls `readClock()` once on the server and passes the result down
 * as plain strings. Components never call `new Date()` themselves, so:
 *
 *   - a snapshot is reproducible (the same inputs always render the same HTML);
 *   - "today" means today at the venue, not today wherever the visitor is;
 *   - server and client markup cannot disagree, so hydration is stable.
 */

import { todayInZone } from "@/lib/date-format";
import { siteConfig } from "@/lib/site-config";

export type Clock = {
  /** Full instant, ISO 8601 UTC. */
  nowISO: string;
  /** The venue-local calendar date, e.g. "2026-10-13". */
  todayISO: string;
  /** The calendar date one week after `todayISO`, for window checks. */
  weekISO: string;
};

export function readClock(): Clock {
  const now = new Date();
  const todayISO = todayInZone(siteConfig.timezone, now);
  const [year, month, day] = todayISO.split("-").map(Number);
  const week = new Date(Date.UTC(year, month - 1, day + 7, 12));

  return {
    nowISO: now.toISOString(),
    todayISO,
    weekISO: `${week.getUTCFullYear()}-${String(week.getUTCMonth() + 1).padStart(2, "0")}-${String(
      week.getUTCDate(),
    ).padStart(2, "0")}`,
  };
}
