/**
 * The single entry point for catalogue and schedule data.
 *
 * There are exactly two sources, and they answer different questions:
 *
 *   "programme" — the sourced national release calendar in
 *                 `data/programme.json`. Real films, real announced release
 *                 dates, each one cited. It carries NO screenings, because a
 *                 release calendar cannot know what this cinema is showing.
 *
 *   "live"      — the venue's own ticketing feed, which is the only thing that
 *                 can supply screening times, screens and per-screening data.
 *
 * Nothing is mixed between them and there is no third source: the development
 * fixtures that used to live in `data/movies.ts` and
 * `data/showtimes.fixture.ts` have been deleted, so there is no code path by
 * which an invented film or an invented screening can reach a page. A build with
 * no feed renders the real release calendar and says plainly that screening
 * times are not connected; it does not quietly substitute anything.
 */

import { cache } from "react";
import { siteConfig } from "@/lib/site-config";
import { validateSchedule, type ScheduleHealth } from "@/lib/schedule";
import { loadFeed } from "@/lib/feed-source";
import { loadProgramme } from "@/lib/programme";
import { venue } from "@/data/cinema";
import type { Movie, Screen, Showtime, Venue } from "@/lib/types";

export type ScheduleSnapshot =
  | {
      state: "ready";
      mode: "programme" | "live";
      /** Screenings. Always empty on the sourced programme. */
      showtimes: Showtime[];
      /** True only when a real timetable exists to render. */
      scheduleAvailable: boolean;
      /** Films that may be rendered. Never mixed between sources. */
      catalogue: Movie[];
      /** Screens that may be rendered. Empty on the sourced programme. */
      screens: Screen[];
      /** The venue record with `screens` replaced by the active source's screens. */
      venue: Venue;
      /** ISO instant the data was produced by its source. */
      lastUpdated: string | null;
      /** Provider or source name, shown to the visitor. */
      sourceLabel: string;
      /** Statement of what the data is and is not. */
      notice: string | null;
      /** True when a live payload is older than the configured window. */
      isStale: boolean;
      /** Records that failed validation, for build logs and the health report. */
      health: ScheduleHealth | null;
      /** Non-fatal parser problems, e.g. dropped artwork. */
      warnings: string[];
    }
  | {
      state: "unavailable";
      mode: "programme" | "live";
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
 * venue. Screen identity is operational data that belongs to whoever is running
 * the programme, so a partner feed names its own auditoriums without anyone
 * editing a venue facts file — and the sourced programme names none, because a
 * release calendar cannot know how a cinema labels its screens.
 */
function withScreens(screens: Screen[]): Venue {
  return { ...venue, screens };
}

/** Reads, validates and returns the catalogue and schedule for the active source. */
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
      scheduleAvailable: true,
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
   * Sourced programme. This is real data with no screenings attached, so the
   * snapshot is "ready" for the catalogue and explicitly not available as a
   * schedule — a distinction the UI renders, rather than an empty timetable that
   * could be mistaken for "nothing is on".
   */
  const programme = loadProgramme();

  if (programme.movies.length === 0) {
    return {
      state: "unavailable",
      mode: "programme",
      reason: "No film programme could be read.",
      detail:
        programme.rejected.length > 0
          ? `Every entry in data/programme.json failed validation:\n  - ${programme.rejected
              .map((entry) => `${entry.slug}: ${entry.errors.join("; ")}`)
              .join("\n  - ")}`
          : "data/programme.json contains no films.",
      lastUpdated: null,
    };
  }

  const noScreens: Screen[] = [];

  return {
    state: "ready",
    mode: "programme",
    showtimes: [],
    scheduleAvailable: false,
    catalogue: programme.movies,
    screens: noScreens,
    venue: withScreens(noScreens),
    lastUpdated: null,
    sourceLabel: programme.sourceLabel,
    notice: programme.caveat,
    isStale: false,
    health: null,
    warnings: programme.rejected.map(
      (entry) => `data/programme.json — dropped "${entry.slug}": ${entry.errors.join("; ")}`,
    ),
  };
}

/**
 * The venue record with whatever screen list is currently authoritative.
 *
 * Used by the venue-information sections, which must keep working when there is
 * no schedule: the address and access facts are owner-supplied and have nothing
 * to do with whether a partner API is answering. Only the screen list depends on
 * a feed, so only the screen list degrades — and it never falls back to invented
 * auditoriums.
 */
export const getVenueWithScreens = cache(
  async (): Promise<{ venue: Venue; screensFrom: "feed" | "unavailable" }> => {
    const snapshot = await getScheduleSnapshot();
    if (snapshot.state === "ready" && snapshot.screens.length > 0) {
      return {
        venue: snapshot.venue,
        screensFrom: snapshot.mode === "live" ? "feed" : "unavailable",
      };
    }
    return { venue: { ...venue, screens: [] }, screensFrom: "unavailable" };
  },
);

/**
 * Development- and operator-facing report of rejected records. Shown on the
 * movies page in development so a malformed payload or programme file is visible
 * while the integration is being built.
 */
export function describeHealth(health: ScheduleHealth): string | null {
  if (health.rejected.length === 0) return null;
  const lines = health.rejected.map((entry, index) => `  ${index + 1}. ${entry.errors.join("; ")}`);
  return `Rejected ${health.rejected.length} schedule record(s):\n${lines.join("\n")}`;
}
