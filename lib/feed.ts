/**
 * The venue feed contract, as an executable specification.
 *
 * WHAT THIS IS
 * ------------
 * A cinema site is only as real as its data. This module defines the JSON shape
 * the venue's ticketing partner (or the venue itself) must supply, and validates
 * every byte of it before a single film or screening reaches a page. It is the
 * difference between a site with sample data in it and a site that is one
 * environment variable away from being live.
 *
 * Everything here is pure: no network, no environment reads, no clock. That is
 * deliberate — it is what makes the contract testable, and `scripts/checks.mts`
 * exercises it directly.
 *
 * THE RULES IT ENFORCES
 * ---------------------
 * 1. **Referential integrity.** A screening can only name a film, a screen and a
 *    venue that exist in the same payload.
 * 2. **No unlicensed artwork.** Artwork is only accepted from hosts the operator
 *    has explicitly allow-listed, and only when the payload also declares the
 *    licence covering it. A poster is dropped, with a warning, rather than
 *    rendered — the failure mode is "no image", never "someone else's image".
 * 3. **No self-declared fixtures.** A record arriving from the live feed cannot
 *    claim `source: "fixture"`. Live is live; the parser decides, not the feed.
 * 4. **No invented values.** Unknown formats, unknown availability states and
 *    out-of-range runtimes are errors, not values to coerce. Coercion is how a
 *    site ends up claiming a 3D screening that is really 2D.
 * 5. **Accessibility is not optional.** A poster without alt text is not
 *    accepted. The image is dropped and reported, because a poster is the film's
 *    title to a screen-reader user.
 *
 * See FEED_CONTRACT.md for the human-readable version of this, written for
 * whoever has to produce the JSON.
 */

import { isValidCalendarDate, isValidIsoWithOffset } from "@/lib/date-format";
import type {
  Availability,
  Format,
  Language,
  Movie,
  MovieStatus,
  Screen,
  Showtime,
} from "@/lib/types";
import { validateShowtime } from "@/lib/schedule";

/** Bumped when the accepted payload shape changes in a breaking way. */
export const FEED_VERSION = 1;

const FORMATS: readonly Format[] = ["2D", "3D", "IMAX", "4DX", "ScreenX", "Dolby Atmos"];
const AVAILABILITY: readonly Availability[] = ["unknown", "available", "few_left", "sold_out"];
const STATUSES: readonly MovieStatus[] = ["now_showing", "coming_soon"];

/** A slug becomes a URL path segment, so it is constrained rather than trusted. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type ParsedFeed = {
  venueId: string;
  /** When the provider generated this payload. Drives the staleness warning. */
  generatedAt: string;
  /** Shown to the visitor as the origin of the data. */
  sourceLabel: string;
  /** Free-text licence statement covering the artwork in this payload. */
  artworkLicence: string | null;
  screens: Screen[];
  movies: Movie[];
  showtimes: Showtime[];
};

export type FeedParseResult =
  | { ok: true; feed: ParsedFeed; warnings: string[] }
  | { ok: false; errors: string[]; warnings: string[] };

export type FeedParseOptions = {
  /** The venue this site is for. A feed for anywhere else is refused outright. */
  expectedVenueId: string;
  /** IANA zone the venue operates in. Every screening must agree. */
  timezone: string;
  /**
   * Hosts permitted to serve artwork. Empty means no remote artwork is accepted
   * at all, which is the correct default: an empty allow-list fails closed.
   */
  artworkHostAllowlist: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/**
 * Accepts only absolute HTTPS URLs on an allow-listed host.
 *
 * HTTP is refused because film artwork on a venue site should never travel in
 * the clear, and protocol-relative or relative URLs are refused because they
 * hide the origin — the whole point of the check is knowing whose CDN it is.
 */
function allowedArtworkUrl(raw: unknown, allowlist: string[]): { url: string | null; reason: string | null } {
  const value = nonEmptyString(raw);
  if (value === null) return { url: null, reason: null };
  if (allowlist.length === 0) {
    return { url: null, reason: "no artwork hosts are allow-listed (set POSTER_HOST_ALLOWLIST)" };
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return { url: null, reason: `artwork URL is not absolute: "${value.slice(0, 60)}"` };
  }

  const host = parsed.hostname.toLowerCase();
  const isLoopback = host === "127.0.0.1" || host === "::1" || host === "localhost";

  /*
   * HTTPS is required, with one documented exception: a loopback host may serve
   * plain HTTP so a stand-in feed can run locally (`npm run feed:serve`) and the
   * whole artwork path be exercised without a certificate. No public host can
   * reach this branch, so it cannot weaken a production deployment.
   */
  if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && isLoopback)) {
    return {
      url: null,
      reason: `artwork URL must be https (or http on a loopback test host), got "${parsed.protocol}//"`,
    };
  }
  const permitted = allowlist.some((entry) => host === entry || host.endsWith(`.${entry}`));
  if (!permitted) {
    return { url: null, reason: `artwork host "${host}" is not allow-listed` };
  }

  return { url: parsed.toString(), reason: null };
}

function parseLanguages(raw: unknown, slug: string, errors: string[]): Language[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    errors.push(`movie "${slug}": "languages" must be a non-empty array`);
    return [];
  }
  const languages: Language[] = [];
  for (const entry of raw) {
    if (!isRecord(entry)) {
      errors.push(`movie "${slug}": each language must be an object`);
      continue;
    }
    const code = nonEmptyString(entry.code);
    const label = nonEmptyString(entry.label);
    if (!code || !label) {
      errors.push(`movie "${slug}": each language needs "code" and "label"`);
      continue;
    }
    languages.push({ code, label });
  }
  return languages;
}

function parseCertification(
  raw: unknown,
  slug: string,
  errors: string[],
): { label: string; body: string } | null {
  if (raw === null || raw === undefined) return null;
  if (!isRecord(raw)) {
    errors.push(`movie "${slug}": "certification" must be null or an object`);
    return null;
  }
  const label = nonEmptyString(raw.label);
  const body = nonEmptyString(raw.body);
  if (!label || !body) {
    errors.push(`movie "${slug}": certification needs both "label" and "body"`);
    return null;
  }
  return { label, body };
}

function parseMovie(
  raw: unknown,
  index: number,
  options: FeedParseOptions,
  warnings: string[],
  errors: string[],
  requireArtworkLicence: { owed: boolean },
): Movie | null {
  const where = `movies[${index}]`;
  if (!isRecord(raw)) {
    errors.push(`${where}: not an object`);
    return null;
  }

  const slug = nonEmptyString(raw.slug);
  if (!slug) {
    errors.push(`${where}: "slug" is required`);
    return null;
  }
  if (!SLUG_PATTERN.test(slug)) {
    errors.push(`movie "${slug}": slug must be kebab-case (a-z, 0-9 and hyphens)`);
    return null;
  }

  const title = nonEmptyString(raw.title);
  if (!title) errors.push(`movie "${slug}": "title" is required`);

  const synopsis = nonEmptyString(raw.synopsis);
  if (!synopsis) errors.push(`movie "${slug}": "synopsis" is required`);

  const status = nonEmptyString(raw.status);
  if (!status || !STATUSES.includes(status as MovieStatus)) {
    errors.push(`movie "${slug}": "status" must be one of ${STATUSES.join(", ")}`);
  }

  const languages = parseLanguages(raw.languages, slug, errors);
  const certification = parseCertification(raw.certification, slug, errors);

  const runtimeRaw = raw.runtimeMinutes;
  let runtimeMinutes: number | null = null;
  if (runtimeRaw !== null && runtimeRaw !== undefined) {
    if (typeof runtimeRaw !== "number" || !Number.isInteger(runtimeRaw) || runtimeRaw <= 0 || runtimeRaw > 600) {
      errors.push(`movie "${slug}": "runtimeMinutes" must be null or a whole number of minutes (1-600)`);
    } else {
      runtimeMinutes = runtimeRaw;
    }
  }

  const genresRaw = raw.genres;
  const genres: string[] = [];
  if (Array.isArray(genresRaw)) {
    for (const genre of genresRaw) {
      const value = nonEmptyString(genre);
      if (value) genres.push(value);
    }
  }

  const formatsRaw = raw.formats;
  const formats: Format[] = [];
  if (Array.isArray(formatsRaw)) {
    for (const format of formatsRaw) {
      if (typeof format === "string" && FORMATS.includes(format as Format)) {
        formats.push(format as Format);
      } else {
        errors.push(`movie "${slug}": unknown format "${String(format)}"`);
      }
    }
  }

  const releaseDateRaw = raw.releaseDate;
  let releaseDate: string | null = null;
  if (releaseDateRaw !== null && releaseDateRaw !== undefined) {
    if (typeof releaseDateRaw !== "string" || !isValidCalendarDate(releaseDateRaw)) {
      errors.push(`movie "${slug}": "releaseDate" must be null or an ISO calendar date`);
    } else {
      releaseDate = releaseDateRaw;
    }
  }

  /*
   * Artwork. A poster is only kept when the host is allow-listed AND alt text is
   * supplied. Either failure drops the image and records why — the UI falls back
   * to a neutral tile rather than showing a broken or unlicensed picture.
   */
  const artwork = allowedArtworkUrl(raw.posterUrl, options.artworkHostAllowlist);
  let posterPath = "";
  let posterAlt = "";

  if (artwork.reason) {
    warnings.push(`movie "${slug}": artwork dropped — ${artwork.reason}`);
  }
  if (artwork.url) {
    const alt = nonEmptyString(raw.posterAlt);
    if (!alt) {
      warnings.push(`movie "${slug}": artwork dropped — no "posterAlt" supplied for accessibility`);
    } else {
      posterPath = artwork.url;
      posterAlt = alt;
      requireArtworkLicence.owed = true;
    }
  }

  if (errors.length > 0) return null;

  return {
    slug,
    title: title as string,
    originalTitle: nonEmptyString(raw.originalTitle),
    status: status as MovieStatus,
    synopsis: synopsis as string,
    languages,
    runtimeMinutes,
    genres,
    certification,
    formats,
    posterPath,
    posterAlt,
    releaseDate,
    rights: {
      artwork:
        nonEmptyString(raw.artworkCredit) ??
        (posterPath ? "Artwork supplied by the provider feed" : "No artwork supplied"),
      copy: nonEmptyString(raw.copyCredit) ?? `Synopsis supplied by ${options.expectedVenueId} feed`,
    },
  };
}

function parseScreen(raw: unknown, index: number, errors: string[]): Screen | null {
  const where = `screens[${index}]`;
  if (!isRecord(raw)) {
    errors.push(`${where}: not an object`);
    return null;
  }
  const id = nonEmptyString(raw.id);
  const name = nonEmptyString(raw.name);
  if (!id) errors.push(`${where}: "id" is required`);
  if (!name) errors.push(`${where}: "name" is required`);

  const formats: Format[] = [];
  if (Array.isArray(raw.formats)) {
    for (const format of raw.formats) {
      if (typeof format === "string" && FORMATS.includes(format as Format)) {
        formats.push(format as Format);
      } else {
        errors.push(`screen "${id}": unknown format "${String(format)}"`);
      }
    }
  }

  const features: string[] = [];
  if (Array.isArray(raw.accessibleFeatures)) {
    for (const feature of raw.accessibleFeatures) {
      const value = nonEmptyString(feature);
      if (value) features.push(value);
    }
  }

  if (errors.length > 0) return null;
  return { id: id as string, name: name as string, formats, accessibleFeatures: features };
}

/**
 * Validates a complete feed payload.
 *
 * Returns either a feed that is safe to render, or the list of reasons it is not.
 * Warnings describe things that were dropped while the rest of the payload
 * survived — a poster on an unknown host, for instance — and are surfaced in the
 * build log and on `/help` in development so they are not silently swallowed.
 */
export function parseVenueFeed(raw: unknown, options: FeedParseOptions): FeedParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isRecord(raw)) {
    return { ok: false, errors: ["payload is not a JSON object"], warnings };
  }

  const version = raw.version;
  if (version !== undefined && version !== FEED_VERSION) {
    return {
      ok: false,
      errors: [`unsupported feed version ${String(version)}; this site accepts version ${FEED_VERSION}`],
      warnings,
    };
  }

  const venueId = nonEmptyString(raw.venueId);
  if (!venueId) {
    errors.push('"venueId" is required');
  } else if (venueId !== options.expectedVenueId) {
    return {
      ok: false,
      errors: [
        `feed is for venue "${venueId}" but this site serves "${options.expectedVenueId}" — refusing to render another venue's programme`,
      ],
      warnings,
    };
  }

  const generatedAt = nonEmptyString(raw.generatedAt);
  if (!generatedAt || !isValidIsoWithOffset(generatedAt)) {
    errors.push('"generatedAt" must be ISO 8601 with an explicit UTC offset');
  }

  const sourceLabel = nonEmptyString(raw.sourceLabel);
  const artworkLicence = nonEmptyString(raw.artworkLicence);

  if (!Array.isArray(raw.movies) || raw.movies.length === 0) {
    errors.push('"movies" must be a non-empty array');
  }
  if (!Array.isArray(raw.screens) || raw.screens.length === 0) {
    errors.push('"screens" must be a non-empty array');
  }
  if (!Array.isArray(raw.showtimes)) {
    errors.push('"showtimes" must be an array');
  }

  if (errors.length > 0) return { ok: false, errors, warnings };

  const screens: Screen[] = [];
  for (const [index, entry] of (raw.screens as unknown[]).entries()) {
    const before = errors.length;
    const screen = parseScreen(entry, index, errors);
    if (screen && errors.length === before) screens.push(screen);
  }
  if (screens.length === 0) errors.push("no usable screens in payload");

  const requireArtworkLicence = { owed: false };
  const movies: Movie[] = [];
  for (const [index, entry] of (raw.movies as unknown[]).entries()) {
    const before = errors.length;
    const movie = parseMovie(entry, index, options, warnings, errors, requireArtworkLicence);
    if (movie && errors.length === before) movies.push(movie);
  }
  if (movies.length === 0) errors.push("no usable films in payload");

  if (requireArtworkLicence.owed && !artworkLicence) {
    errors.push(
      '"artworkLicence" is required when the payload supplies artwork — state the licence covering the posters (for example an asset-kit reference or the partner agreement)',
    );
  }

  /*
   * Screenings are validated against the payload's OWN films and screens, not the
   * development fixtures. A partner feed for a new release must not need a code
   * change to be believed.
   */
  const showtimes: Showtime[] = [];
  const movieSlugs = new Set(movies.map((movie) => movie.slug));
  const screenIds = new Set(screens.map((screen) => screen.id));
  const seenIds = new Set<string>();

  for (const [index, entry] of (raw.showtimes as unknown[]).entries()) {
    const result = validateShowtime(entry);
    if (!result.ok) {
      warnings.push(`showtimes[${index}]: dropped — ${result.errors.join("; ")}`);
      continue;
    }
    const showtime = result.value;

    const problems: string[] = [];
    if (!movieSlugs.has(showtime.movieSlug)) problems.push(`unknown film "${showtime.movieSlug}"`);
    if (!screenIds.has(showtime.screenId)) problems.push(`unknown screen "${showtime.screenId}"`);
    if (showtime.venueId !== options.expectedVenueId) problems.push(`unknown venue "${showtime.venueId}"`);
    if (showtime.timezone !== options.timezone) problems.push(`timezone "${showtime.timezone}" does not match the venue`);
    if (seenIds.has(showtime.id)) problems.push(`duplicate screening id "${showtime.id}"`);
    if (showtime.source !== "live") problems.push('a live feed record declared source:"fixture"');

    if (problems.length > 0) {
      warnings.push(`showtimes[${index}]: dropped — ${problems.join("; ")}`);
      continue;
    }

    seenIds.add(showtime.id);
    /*
     * The parser, not the feed, decides provenance. Everything that survives to
     * this point is live provider data by definition.
     */
    showtimes.push({
      ...showtime,
      source: "live",
      provenance: showtime.provenance || (sourceLabel ?? "Venue provider feed"),
    });
  }

  if (showtimes.length === 0) warnings.push("the payload contained no usable screenings");

  if (errors.length > 0) return { ok: false, errors, warnings };

  /*
   * Reaching here means nothing above pushed an error, so the venue id and the
   * timestamp are genuinely present; the assertions just record that for the
   * type checker, which cannot see the causal link between `errors` being empty
   * and these two being non-null.
   */
  return {
    ok: true,
    warnings,
    feed: {
      venueId: venueId as string,
      generatedAt: generatedAt as string,
      sourceLabel: sourceLabel ?? "Venue provider feed",
      artworkLicence,
      screens,
      movies,
      showtimes,
    },
  };
}

/**
 * How stale a payload is, in hours, relative to a supplied "now".
 *
 * Kept pure so the thresholds can be tested without freezing a clock.
 */
export function feedAgeHours(generatedAt: string, nowISO: string): number | null {
  const generated = Date.parse(generatedAt);
  const now = Date.parse(nowISO);
  if (Number.isNaN(generated) || Number.isNaN(now)) return null;
  return (now - generated) / 3_600_000;
}

export { FORMATS as FEED_FORMATS, AVAILABILITY as FEED_AVAILABILITY, SLUG_PATTERN as FEED_SLUG_PATTERN };
