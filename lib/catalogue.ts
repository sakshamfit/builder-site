/**
 * The film catalogue, resolved for whichever source is active.
 *
 * Pages use this instead of importing a data file directly. That is the whole
 * point: neither the sourced programme nor the feed payload is reachable from a
 * page, so a page cannot render a film from a source the rest of the page is not
 * using. When the active source has nothing to offer, this returns "unavailable"
 * with a reason instead of quietly substituting something else.
 */

import { cache } from "react";
import { getScheduleSnapshot } from "@/lib/schedule-source";
import type { Movie, Venue } from "@/lib/types";

export type Catalogue =
  | {
      available: true;
      mode: "programme" | "live";
      /** True when the venue's own feed is authoritative. */
      isLive: boolean;
      /**
       * True only when real screening times exist. False on the sourced
       * programme: the films are real, the timetable is not connected.
       */
      scheduleAvailable: boolean;
      /** What the data is and is not. Rendered wherever the catalogue appears. */
      notice: string | null;
      sourceLabel: string;
      lastUpdated: string | null;
      /** Every film the active source knows about. */
      movies: Movie[];
      /** Films a source says are in cinemas (or on sale). */
      released: Movie[];
      /** Films with a future release date. */
      upcoming: Movie[];
      /** The venue record with the active source's screens. */
      venue: Venue;
      /** True when a live payload is past its freshness window. */
      isStale: boolean;
    }
  | {
      available: false;
      mode: "programme" | "live";
      reason: string;
      /** Operator-facing detail. Development builds render it. */
      detail: string;
    };

/** Films with a future release date, soonest first. */
function sortUpcoming(movies: Movie[]): Movie[] {
  return [...movies]
    .filter((movie) => movie.status === "coming_soon")
    .sort((a, b) => (a.releaseDate ?? "").localeCompare(b.releaseDate ?? ""));
}

export const loadCatalogue = cache(async (): Promise<Catalogue> => {
  const snapshot = await getScheduleSnapshot();

  if (snapshot.state !== "ready") {
    return {
      available: false,
      mode: snapshot.mode,
      reason: snapshot.reason,
      detail: snapshot.detail,
    };
  }

  return {
    available: true,
    mode: snapshot.mode,
    isLive: snapshot.mode === "live",
    scheduleAvailable: snapshot.scheduleAvailable,
    notice: snapshot.notice,
    sourceLabel: snapshot.sourceLabel,
    lastUpdated: snapshot.lastUpdated,
    movies: snapshot.catalogue,
    released: snapshot.catalogue.filter((movie) => movie.status === "now_showing"),
    upcoming: sortUpcoming(snapshot.catalogue),
    venue: snapshot.venue,
    isStale: snapshot.isStale,
  };
});

/** Case-sensitive exact lookup, because slugs are part of the public URL. */
export function findMovie(catalogue: Catalogue, slug: string): Movie | undefined {
  if (!catalogue.available) return undefined;
  return catalogue.movies.find((movie) => movie.slug === slug);
}
