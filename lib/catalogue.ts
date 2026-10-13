/**
 * The film catalogue, resolved for whichever data mode is active.
 *
 * Pages use this instead of importing `data/movies.ts` directly. That is the
 * whole point: the fixture catalogue must not be reachable from a page, because
 * a page that imports it can render a sample film on a live site. Here, the
 * fixture is only ever returned when the site is genuinely in fixture mode, and
 * a live site with an unreachable feed returns "unavailable" rather than quietly
 * substituting sample films.
 */

import { cache } from "react";
import { getScheduleSnapshot } from "@/lib/schedule-source";
import type { Movie, Venue } from "@/lib/types";

export type Catalogue =
  | {
      available: true;
      mode: "fixture" | "live";
      isFixture: boolean;
      /** Every film the current source knows about. */
      movies: Movie[];
      nowShowing: Movie[];
      comingSoon: Movie[];
      /** The venue record with the active source's screens. */
      venue: Venue;
      sourceLabel: string;
      /** True when a live payload is past its freshness window. */
      isStale: boolean;
    }
  | {
      available: false;
      mode: "fixture" | "live";
      reason: string;
      /** Operator-facing detail. Development builds render it. */
      detail: string;
    };

/** Films the cinema has confirmed are on the way, soonest first. */
function sortComingSoon(movies: Movie[]): Movie[] {
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
    isFixture: snapshot.mode === "fixture",
    movies: snapshot.catalogue,
    nowShowing: snapshot.catalogue.filter((movie) => movie.status === "now_showing"),
    comingSoon: sortComingSoon(snapshot.catalogue),
    venue: snapshot.venue,
    sourceLabel: snapshot.sourceLabel,
    isStale: snapshot.isStale,
  };
});

/** Case-sensitive exact lookup, because slugs are part of the public URL. */
export function findMovie(catalogue: Catalogue, slug: string): Movie | undefined {
  if (!catalogue.available) return undefined;
  return catalogue.movies.find((movie) => movie.slug === slug);
}
