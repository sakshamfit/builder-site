/**
 * The single entry point for schedule data.
 *
 * Pages call `getScheduleSnapshot()` and render one of two states. This keeps
 * the difference between sample data and live data in exactly one place, and
 * makes the "schedule unavailable" path a first-class state rather than an
 * afterthought.
 *
 * LIVE MODE IS INTENTIONALLY INCOMPLETE
 * -------------------------------------
 * When NEXT_PUBLIC_DATA_MODE=live and no verified feed is configured, this
 * returns `state: "unavailable"` with a reason. That is the intended behaviour:
 * the site says it cannot reach the schedule instead of showing sample times to
 * the public. Wire the fetch in `loadLiveSchedule()` when provider access
 * exists — the validation below already handles untrusted input.
 */

import { siteConfig, type DataMode } from "@/lib/site-config";
import { validateSchedule, type ScheduleHealth } from "@/lib/schedule";
import {
  FIXTURE_LAST_UPDATED,
  FIXTURE_NOTICE,
  fixtureShowtimes,
} from "@/data/showtimes.fixture";
import { movies } from "@/data/movies";
import { venue } from "@/data/cinema";
import type { Showtime } from "@/lib/types";

export type ScheduleSnapshot =
  | {
      state: "ready";
      mode: DataMode;
      showtimes: Showtime[];
      /** ISO instant this snapshot was produced. */
      lastUpdated: string;
      /** Provider or source name, shown to the visitor. */
      sourceLabel: string;
      /** Prominent notice for sample data. Null when live. */
      notice: string | null;
      /** Records that failed validation, for build logs and the health report. */
      health: ScheduleHealth;
    }
  | {
      state: "unavailable";
      mode: DataMode;
      /** Plain-language reason, safe to show a visitor. */
      reason: string;
      /** Technical detail for logs. Rendered in development only. */
      detail: string;
      lastUpdated: string | null;
    };

/**
 * Live feed loader. Replace the body with the provider request and validate the
 * response with lib/schedule.ts#validateShowtime before it is trusted.
 *
 * Kept as a stub on purpose: the feed URL and credentials are owner decisions,
 * and a half-written integration that silently returns invented data would be
 * worse than no integration at all.
 */
async function loadLiveSchedule(): Promise<never> {
  throw new Error(
    "No verified schedule feed is configured. Set SCHEDULE_FEED_URL and implement loadLiveSchedule().",
  );
}

/** Reads, validates and returns the schedule for the current data mode. */
export async function getScheduleSnapshot(): Promise<ScheduleSnapshot> {
  if (siteConfig.dataMode === "live") {
    const feedUrl = siteConfig.ticketing.feedUrl;
    if (!feedUrl) {
      return {
        state: "unavailable",
        mode: "live",
        reason: "The verified schedule feed is not configured yet.",
        detail:
          "NEXT_PUBLIC_DATA_MODE is \"live\" but SCHEDULE_FEED_URL is empty, so no schedule can be fetched.",
        lastUpdated: null,
      };
    }

    try {
      await loadLiveSchedule();
      // Unreachable until the integration is implemented.
      return {
        state: "unavailable",
        mode: "live",
        reason: "The schedule feed returned no usable data.",
        detail: "loadLiveSchedule() is not implemented yet.",
        lastUpdated: null,
      };
    } catch (error) {
      return {
        state: "unavailable",
        mode: "live",
        reason: "We could not reach the cinema's schedule.",
        detail: error instanceof Error ? error.message : "Unknown feed error.",
        lastUpdated: null,
      };
    }
  }

  // Fixture mode: validate the samples through the same path a live feed uses,
  // so the validation itself is exercised on every build.
  const health = validateSchedule(fixtureShowtimes, movies, venue);

  if (health.valid.length === 0) {
    return {
      state: "unavailable",
      mode: "fixture",
      reason: "The development schedule could not be read.",
      detail: `All ${fixtureShowtimes.length} fixture records failed validation.`,
      lastUpdated: null,
    };
  }

  return {
    state: "ready",
    mode: "fixture",
    showtimes: health.valid,
    lastUpdated: FIXTURE_LAST_UPDATED,
    sourceLabel: "Development sample schedule",
    notice: FIXTURE_NOTICE,
    health,
  };
}

/**
 * Development-only report of rejected records. Called from the Movies page in
 * development so a malformed fixture is visible while it is being written.
 */
export function describeHealth(health: ScheduleHealth): string | null {
  if (health.rejected.length === 0) return null;
  const lines = health.rejected.map(
    (entry, index) => `  ${index + 1}. ${entry.errors.join("; ")}`,
  );
  return `Rejected ${health.rejected.length} schedule record(s):\n${lines.join("\n")}`;
}
