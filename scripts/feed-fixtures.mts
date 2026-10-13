/**
 * Payloads used to prove the live feed path works.
 *
 * Two jobs:
 *   1. `buildValidFeed()` produces a well-formed payload so the whole live path
 *      — fetch, validate, render, hand off — can be exercised without a partner
 *      account. `npm run feed:serve` hosts it.
 *   2. `INVALID_FEEDS` produces payloads that are each broken in exactly one way,
 *      so `scripts/checks.mts` can assert the validator rejects every one of
 *      them. A validator that has never been shown a bad payload is not a
 *      validator.
 *
 * The placeholder titles are deliberately ugly. A test feed that looked like a
 * real programme could end up on a real site; one that reads "PLACEHOLDER FILM A"
 * cannot.
 *
 * Nothing here is ever bundled into the app: it lives under scripts/ and is used
 * by the checks and the local feed server only.
 */

import { addDays, todayInZone } from "@/lib/date-format";
import { zoneOffsetString } from "@/lib/date-format";

export const TEST_VENUE_ID = "madhuban-bihar";
export const TEST_TIMEZONE = "Asia/Kolkata";
/** Host the local demo server serves artwork from. Must be allow-listed to work. */
export const TEST_ARTWORK_HOST = "127.0.0.1";

type FeedMovie = {
  slug: string;
  title: string;
  status: "now_showing" | "coming_soon";
  synopsis: string;
  languages: { code: string; label: string }[];
  runtimeMinutes: number | null;
  genres: string[];
  certification: { label: string; body: string } | null;
  formats: string[];
  releaseDate?: string | null;
  posterUrl?: string | null;
  posterAlt?: string | null;
  artworkCredit?: string;
};

type FeedPayload = Record<string, unknown>;

/** A valid payload for today, with screenings over the next three days. */
export function buildValidFeed(options: { includeArtwork?: boolean; nowISO?: string } = {}): FeedPayload {
  const today = todayInZone(TEST_TIMEZONE, options.nowISO ? new Date(options.nowISO) : new Date());
  const artworkHost = `${TEST_ARTWORK_HOST}:4100`;
  const includeArtwork = options.includeArtwork ?? true;

  const movies: FeedMovie[] = [
    {
      slug: "placeholder-film-a",
      title: "PLACEHOLDER FILM A",
      status: "now_showing",
      synopsis:
        "Integration test record. Not a real film. Used to verify that a partner payload renders correctly end to end.",
      languages: [
        { code: "hi", label: "Hindi" },
        { code: "en", label: "English" },
      ],
      runtimeMinutes: 132,
      genres: ["Test"],
      certification: { label: "U/A 13+", body: "CBFC" },
      formats: ["2D", "3D"],
    },
    {
      slug: "placeholder-film-b",
      title: "PLACEHOLDER FILM B",
      status: "now_showing",
      synopsis: "Second integration test record. Not a real film.",
      languages: [{ code: "en", label: "English" }],
      runtimeMinutes: 108,
      genres: ["Test"],
      certification: null,
      formats: ["2D"],
    },
    {
      slug: "placeholder-film-c",
      title: "PLACEHOLDER FILM C",
      status: "coming_soon",
      synopsis: "Third integration test record. Not a real film, and not on sale.",
      languages: [{ code: "ta", label: "Tamil" }],
      runtimeMinutes: null,
      genres: ["Test"],
      certification: null,
      formats: ["2D"],
      releaseDate: addDays(today, 21),
    },
  ];

  if (includeArtwork) {
    for (const movie of movies) {
      /*
       * http, not https: the local stand-in server has no certificate. Loopback
       * hosts are the one documented exception to the https-only rule, so this
       * still exercises the real allow-list path end to end.
       */
      movie.posterUrl = `http://${artworkHost}/posters/${movie.slug}.png`;
      movie.posterAlt = `${movie.title} placeholder poster`;
      movie.artworkCredit = "Generated placeholder artwork, this repository";
    }
  }

  const times = ["10:45", "13:30", "16:15", "19:00", "21:45"];
  const showtimes: Record<string, unknown>[] = [];
  const plan: { movie: string; screen: string; days: number }[] = [
    { movie: "placeholder-film-a", screen: "audi-1", days: 3 },
    { movie: "placeholder-film-b", screen: "audi-2", days: 3 },
  ];

  for (const entry of plan) {
    for (let day = 0; day < entry.days; day += 1) {
      for (const [slot, time] of times.entries()) {
        const dateISO = addDays(today, day);
        const offset = zoneOffsetString(dateISO, time, TEST_TIMEZONE);
        showtimes.push({
          id: `${entry.movie}-${dateISO}-${time.replace(":", "")}`,
          movieSlug: entry.movie,
          venueId: TEST_VENUE_ID,
          screenId: entry.screen,
          startsAt: `${dateISO}T${time}:00${offset}`,
          timezone: TEST_TIMEZONE,
          languageCode: slot % 2 === 0 ? "hi" : "en",
          format: slot === 2 ? "3D" : "2D",
          availability: "unknown",
          priceMinor: null,
          currency: null,
          providerShowtimeId: `prov-${entry.movie}-${dateISO}-${slot}`,
          source: "live",
          provenance: "Local test feed",
        });
      }
    }
  }

  return {
    version: 1,
    venueId: TEST_VENUE_ID,
    generatedAt: new Date(options.nowISO ?? Date.now()).toISOString(),
    sourceLabel: "Local test feed (not a real programme)",
    artworkLicence: "Placeholder artwork generated for this repository",
    screens: [
      { id: "audi-1", name: "Audi 1", formats: ["2D", "3D"], accessibleFeatures: [] },
      { id: "audi-2", name: "Audi 2", formats: ["2D"], accessibleFeatures: [] },
    ],
    movies,
    showtimes,
  };
}

/** Small deep-clone helper so each broken variant starts from a clean payload. */
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export type InvalidFeedCase = {
  name: string;
  /** What the validator must say. Matched as a substring, case-insensitively. */
  expects: string;
  payload: unknown;
  /** Where the message is expected: a fatal error, or a non-fatal warning. */
  channel: "error" | "warning";
};

/**
 * One defect per payload. Ordered from structural to semantic, mirroring the
 * order a real integration tends to break in.
 */
export function buildInvalidFeeds(): InvalidFeedCase[] {
  const valid = buildValidFeed();
  const cases: InvalidFeedCase[] = [];

  cases.push({
    name: "payload is not an object",
    expects: "not a JSON object",
    payload: "<html>502 Bad Gateway</html>",
    channel: "error",
  });

  {
    const payload = clone(valid);
    payload.version = 99;
    cases.push({
      name: "unsupported contract version",
      expects: "unsupported feed version",
      payload,
      channel: "error",
    });
  }

  {
    const payload = clone(valid);
    payload.venueId = "some-other-cinema";
    cases.push({
      name: "payload is for a different venue",
      expects: "refusing to render another venue's programme",
      payload,
      channel: "error",
    });
  }

  {
    const payload = clone(valid);
    payload.generatedAt = "2026-10-13 09:00";
    cases.push({
      name: "generatedAt has no explicit offset",
      expects: '"generatedAt" must be ISO 8601',
      payload,
      channel: "error",
    });
  }

  {
    const payload = clone(valid);
    payload.movies = [];
    cases.push({
      name: "no films",
      expects: '"movies" must be a non-empty array',
      payload,
      channel: "error",
    });
  }

  {
    const payload = clone(valid);
    payload.screens = [];
    cases.push({
      name: "no screens",
      expects: '"screens" must be a non-empty array',
      payload,
      channel: "error",
    });
  }

  {
    const payload = clone(valid);
    (payload.movies as FeedMovie[])[0].slug = "Not A Valid Slug";
    cases.push({
      name: "slug is not a URL-safe path segment",
      expects: "slug must be kebab-case",
      payload,
      channel: "error",
    });
  }

  {
    const payload = clone(valid);
    (payload.movies as FeedMovie[])[0].formats = ["4DX Ultra Pro"];
    cases.push({
      name: "invented format",
      expects: "unknown format",
      payload,
      channel: "error",
    });
  }

  {
    const payload = clone(valid);
    (payload.movies as FeedMovie[])[0].runtimeMinutes = 0;
    cases.push({
      name: "runtime of zero minutes",
      expects: '"runtimeMinutes" must be null or a whole number',
      payload,
      channel: "error",
    });
  }

  {
    const payload = clone(valid);
    (payload.movies as FeedMovie[])[0].posterUrl = "https://unlicensed-cdn.example.com/poster.jpg";
    cases.push({
      name: "artwork from a host that is not allow-listed",
      expects: "is not allow-listed",
      payload,
      channel: "warning",
    });
  }

  {
    const payload = clone(valid);
    (payload.movies as FeedMovie[])[0].posterUrl = "http://cdn.example.com/poster.jpg";
    cases.push({
      name: "artwork served over plain HTTP",
      expects: "must be https",
      payload,
      channel: "warning",
    });
  }

  {
    const payload = clone(valid);
    (payload.movies as FeedMovie[])[0].posterUrl = "ftp://127.0.0.1:4100/poster.svg";
    cases.push({
      name: "artwork on a non-HTTP scheme",
      expects: "must be https",
      payload,
      channel: "warning",
    });
  }

  {
    const payload = clone(valid);
    (payload.movies as FeedMovie[])[0].posterAlt = "";
    cases.push({
      name: "artwork with no alt text",
      expects: "no \"posterAlt\" supplied for accessibility",
      payload,
      channel: "warning",
    });
  }

  {
    const payload = clone(valid);
    delete payload.artworkLicence;
    cases.push({
      name: "artwork supplied without a licence statement",
      expects: '"artworkLicence" is required when the payload supplies artwork',
      payload,
      channel: "error",
    });
  }

  {
    const payload = clone(valid);
    (payload.showtimes as Record<string, unknown>[])[0].screenId = "audi-does-not-exist";
    cases.push({
      name: "screening names an unknown screen",
      expects: 'unknown screen "audi-does-not-exist"',
      payload,
      channel: "warning",
    });
  }

  {
    const payload = clone(valid);
    (payload.showtimes as Record<string, unknown>[])[0].movieSlug = "not-in-the-payload";
    cases.push({
      name: "screening names a film that is not in the payload",
      expects: 'unknown film "not-in-the-payload"',
      payload,
      channel: "warning",
    });
  }

  {
    const payload = clone(valid);
    (payload.showtimes as Record<string, unknown>[])[0].timezone = "Europe/London";
    cases.push({
      name: "screening claims a timezone the venue does not operate in",
      expects: "does not match the venue",
      payload,
      channel: "warning",
    });
  }

  {
    const payload = clone(valid);
    (payload.showtimes as Record<string, unknown>[])[0].source = "fixture";
    cases.push({
      name: "live record declares itself a fixture",
      expects: 'declared source:"fixture"',
      payload,
      channel: "warning",
    });
  }

  {
    const payload = clone(valid);
    (payload.showtimes as Record<string, unknown>[])[0].startsAt = "2026-10-13T19:00:00";
    cases.push({
      name: "start time without an offset",
      expects: "ISO 8601 with an explicit offset",
      payload,
      channel: "warning",
    });
  }

  {
    const payload = clone(valid);
    (payload.showtimes as Record<string, unknown>[])[0].availability = "plenty";
    cases.push({
      name: "unknown availability state",
      expects: '"availability" must be one of',
      payload,
      channel: "warning",
    });
  }

  {
    const payload = clone(valid);
    (payload.showtimes as Record<string, unknown>[])[0].priceMinor = 25000;
    (payload.showtimes as Record<string, unknown>[])[0].currency = null;
    cases.push({
      name: "a price with no currency",
      expects: "a price was supplied without a currency",
      payload,
      channel: "warning",
    });
  }

  {
    const payload = clone(valid);
    const showtimes = payload.showtimes as Record<string, unknown>[];
    showtimes.push({ ...showtimes[0] });
    cases.push({
      name: "duplicate screening id",
      expects: "duplicate screening id",
      payload,
      channel: "warning",
    });
  }

  return cases;
}
