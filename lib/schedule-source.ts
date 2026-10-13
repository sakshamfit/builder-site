/**
 * The single entry point for schedule and catalogue data.
 *
 * Pages call `getScheduleSnapshot()` and render one of two states. This keeps the
 * difference between sample data and live provider data in exactly one place, and
 * makes "the schedule is unavailable" a first-class state rather than an
 * afterthought.
 *
 * Both modes are fully implemented. The only thing separating this build from a
 * live site is configuration:
 *
 *   NEXT_PUBLIC_DATA_MODE=live
 *   SCHEDULE_FEED_URL=https://…
 *   POSTER_HOST_ALLOWLIST=cdn.example.com
 *
 * In live mode the catalogue, the screens and the screenings all come from the
 * partner payload — the development fixtures are not read at all, so there is no
 * path by which a sample film can appear beside a real one.
 */

import { cache } from "react";
import { siteConfig, type DataMode } from "@/lib/site-config";
import { validateSchedule, type ScheduleHealth } from "@/lib/schedule";
import { loadFeed } from "@/lib/feed-source";
import { FIXTURE_LAST_UPDATED, FIXTURE_NOTICE, fixtureShowtimes } from "@/data/showtimes.fixture";
import { movies as fixtureMovies } from "@/data/movies";
import { venue } from "@/data/cinema";
import type { Movie, Screen, Showtime, Venue } from "@/lib/types";

export type ScheduleSnapshot =
  | {
      state: "ready";
      mode: DataMode;
      showtimes: Showtime[];
      /** Films that may be rendered. Never mixed between modes. */
      catalogue: Movie[];
      /** Screens that may be rendered, resolved against the active source. */
      screens: Screen[];
      /** The venue record with `screens` replaced by the active source's screens. */
      venue: Venue;
      /** ISO instant the data was produced by its source. */
      lastUpdated: string;
      /** Provider or source name, shown to the visitor. */
      sourceLabel: string;
      /** Prominent notice for sample data. Null when live. */
      notice: string | null;
      /** True when a live payload is older than the configured window. */
      isStale: boolean;
      /** Records that failed validation, for build logs and the health report. */
      health: ScheduleHealth;
      /** Non-fatal parser problems, e.g. dropped artwork. */
      warnings: string[];
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
 * Replaces the venue's screen list with the active source's screens.
 *
 * The venue record in `data/cinema.ts` holds owner-confirmed facts about the
 * venue; the screen list is operational data that belongs to whoever is running
 * the programme. Keeping them separate means a partner feed can name its own
 * auditoriums without anyone editing a venue facts file.
 */
function withScreens(screens: Screen[]): Venue {
  return { ...venue, screens };
}

/** Reads, validates and returns the schedule for the current data mode. */
export async function getScheduleSnapshot(): Promise<ScheduleSnapshot> {
  if (siteConfig.dataMode === "live") {
    const load = await loadFeed();

    if (load.state === "unavailable") {
      return {
        state: "unavailable",
        mode: "live",
        reason: load.reason,
        detail: load.detail,
        lastUpdated: null,
      };
    }

    const screens = load.feed.screens;
    const resolvedVenue = withScreens(screens);

    /*
     * Integrity is re-checked here against the payload's own catalogue and
     * screens even though `parseVenueFeed` already did it. The two checks have
     * different jobs: the parser rejects what is malformed, this rejects what is
     * inconsistent with the venue record we are actually rendering.
     */
    const health = validateSchedule(load.feed.showtimes, load.feed.movies, resolvedVenue);

    if (health.valid.length === 0) {
      return {
        state: "unavailable",
        mode: "live",
        reason: "The cinema's schedule could not be read.",
        detail: `All ${load.feed.showtimes.length} supplied screenings failed validation.${
          health.rejected.length > 0
            ? `\n  - ${health.rejected
                .slice(0, 5)
                .map((entry) => entry.errors.join("; "))
                .join("\n  - ")}`
            : ""
        }`,
        lastUpdated: load.feed.generatedAt,
      };
    }

    return {
      state: "ready",
      mode: "live",
      showtimes: health.valid,
      catalogue: load.feed.movies,
      screens,
      venue: resolvedVenue,
      lastUpdated: load.feed.generatedAt,
      sourceLabel: load.feed.sourceLabel,
      notice: null,
      isStale: load.isStale,
      health,
      warnings: load.warnings,
    };
  }

  /*
   * Fixture mode. The samples run through the same validation a live feed uses,
   * so the validation itself is exercised on every build rather than being dead
   * code until launch.
   */
  const health = validateSchedule(fixtureShowtimes, fixtureMovies, venue);

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
    catalogue: fixtureMovies,
    screens: venue.screens,
    venue,
    lastUpdated: FIXTURE_LAST_UPDATED,
    sourceLabel: "Development sample schedule",
    notice: FIXTURE_NOTICE,
    isStale: false,
    health,
    warnings: [],
  };
}

/**
 * The venue record with whatever screen list is currently authoritative.
 *
 * Used by the venue-information sections, which must keep working when the
 * programme feed is down: the address and access facts are owner-supplied and
 * have nothing to do with whether a partner API is answering. Only the screen
 * list depends on the feed, so only the screen list degrades.
 */
export const getVenueWithScreens = cache(
  async (): Promise<{ venue: Venue; screensFrom: "feed" | "sample" | "unavailable" }> => {
    const snapshot = await getScheduleSnapshot();
    if (snapshot.state === "ready") {
      return {
        venue: snapshot.venue,
        screensFrom: snapshot.mode === "live" ? "feed" : "sample",
      };
    }
    // No screens to offer. The venue facts still render; the screen section says
    // why it cannot list any rather than falling back to sample auditoriums,
    // which would be inventing a venue's layout.
    return { venue: { ...venue, screens: [] }, screensFrom: "unavailable" };
  },
);

/**
 * Development- and operator-facing report of rejected records. Shown on the
 * movies page in development so a malformed payload is visible while the
 * integration is being built.
 */
export function describeHealth(health: ScheduleHealth): string | null {
  if (health.rejected.length === 0) return null;
  const lines = health.rejected.map((entry, index) => `  ${index + 1}. ${entry.errors.join("; ")}`);
  return `Rejected ${health.rejected.length} schedule record(s):\n${lines.join("\n")}`;
}
