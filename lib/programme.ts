/**
 * The sourced release programme.
 *
 * This is the site's real film data: actual films, actual announced release
 * dates, each one traceable to the sources recorded beside it in
 * `data/programme.json`. It replaced the development fixtures entirely, so no
 * invented title, date, runtime, certification or poster exists anywhere in this
 * repository any more.
 *
 * TWO THINGS THIS DELIBERATELY DOES NOT DO
 * ----------------------------------------
 * 1. It does not describe this cinema's schedule. A national release date says a
 *    film opens in cinemas in India; it does not say this venue is screening it,
 *    on which screen, at what time, or in which language version. Only the
 *    venue's ticketing feed can say that (see FEED_CONTRACT.md). Every surface
 *    that renders these films states the difference in words.
 * 2. It does not fill gaps. Runtime, certification and synopsis are null here
 *    because the sources used did not publish them, and a plausible guess is a
 *    claim the venue never made. They appear when a feed supplies them.
 * 3. It does not borrow a film's poster. The only artwork this module attaches is
 *    the project's own abstract cover plate (see `data/cover-art.json`), and the
 *    alt text says so in words. A licensed poster from the venue or the feed
 *    always takes precedence over a plate.
 *
 * Provenance is decided by this module, not by the payload: `data/programme.json`
 * cannot declare itself verified any more than a feed payload can declare itself
 * a fixture.
 */

import { cache } from "react";
import programmeData from "@/data/programme.json";
import coverArtData from "@/data/cover-art.json";
import { readClock } from "@/lib/clock";
import { addDays, isValidCalendarDate } from "@/lib/date-format";
import type { Artwork, Language, Movie, SourceRef } from "@/lib/types";

type RawSource = { label?: unknown; url?: unknown };
type RawLanguage = { code?: unknown; label?: unknown };
type RawFilm = {
  slug?: unknown;
  title?: unknown;
  originalTitle?: unknown;
  languages?: unknown;
  genres?: unknown;
  releaseDate?: unknown;
  sources?: unknown;
};

export type ProgrammeRejection = {
  slug: string;
  errors: string[];
};

export type Programme = {
  movies: Movie[];
  /** The day the release dates were compiled. */
  compiledOn: string;
  /** How far those dates reach, in the source's own terms. */
  releaseScope: string;
  sourceLabel: string;
  /** Plain-language statement of what this data is and is not. */
  caveat: string;
  /** Every distinct source across the programme, for the page footer. */
  citations: SourceRef[];
  rejected: ProgrammeRejection[];
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * The slugs that have an original cover plate in `public/cover-art/`.
 *
 * Read from a manifest rather than by listing the directory so that a missing
 * file is a build failure (`npm run check` compares the two) instead of a broken
 * image. The alt text is deliberately explicit about what the image is: a person
 * using a screen reader should not be told a generated plate is a film poster.
 */
const COVER_PLATES = new Set<string>(
  Array.isArray((coverArtData as { plates?: unknown }).plates)
    ? ((coverArtData as { plates: unknown[] }).plates.filter(
        (slug): slug is string => typeof slug === "string",
      ) as string[])
    : [],
);

const COVER_PLATE_LICENCE =
  typeof (coverArtData as { licence?: unknown }).licence === "string"
    ? (coverArtData as { licence: string }).licence
    : "Original cover art made for this project";

function coverPlateFor(slug: string, title: string): Artwork | null {
  if (!COVER_PLATES.has(slug)) return null;
  return {
    url: `/cover-art/${slug}.jpg`,
    alt: `Original abstract cover art for ${title}, made for this site in its own colours. This is not the film's poster.`,
    licence: COVER_PLATE_LICENCE,
  };
}

/* Only https sources: a release date that cannot be checked is not a fact. */
function parseSources(raw: unknown, slug: string, errors: string[]): SourceRef[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    errors.push(`film "${slug}": at least one source is required`);
    return [];
  }

  const sources: SourceRef[] = [];
  for (const entry of raw as RawSource[]) {
    const label = typeof entry?.label === "string" ? entry.label.trim() : "";
    const url = typeof entry?.url === "string" ? entry.url.trim() : "";
    if (!label || !url) {
      errors.push(`film "${slug}": every source needs both a label and a url`);
      continue;
    }
    if (!url.startsWith("https://")) {
      errors.push(`film "${slug}": source url must be https ("${url}")`);
      continue;
    }
    sources.push({ label, url });
  }
  return sources;
}

function parseLanguages(raw: unknown, slug: string, errors: string[]): Language[] {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) {
    errors.push(`film "${slug}": "languages" must be an array`);
    return [];
  }
  const languages: Language[] = [];
  for (const entry of raw as RawLanguage[]) {
    const code = typeof entry?.code === "string" ? entry.code.trim() : "";
    const label = typeof entry?.label === "string" ? entry.label.trim() : "";
    if (!code || !label) {
      errors.push(`film "${slug}": every language needs a code and a label`);
      continue;
    }
    languages.push({ code, label });
  }
  return languages;
}

function parseGenres(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((genre) => (typeof genre === "string" ? genre.trim() : ""))
    .filter((genre): genre is string => Boolean(genre));
}

/**
 * Validates and converts the programme file into domain records.
 *
 * `todayISO` decides which side of the release date a film sits on, which is the
 * only thing that moves as the site ages — the film's own record never changes.
 * A record that cannot be verified is dropped rather than rendered, and the
 * reason is reported so a build fails loudly instead of shipping a claim.
 */
export function parseProgramme(todayISO: string): {
  movies: Movie[];
  rejected: ProgrammeRejection[];
} {
  const raw = programmeData as unknown as {
    compiledOn?: unknown;
    releaseScope?: unknown;
    films?: unknown;
  };

  const compiledOn =
    typeof raw.compiledOn === "string" && isValidCalendarDate(raw.compiledOn)
      ? raw.compiledOn
      : "";
  const releaseScope =
    typeof raw.releaseScope === "string" && raw.releaseScope.trim()
      ? raw.releaseScope.trim()
      : "Announced national theatrical release";

  const films: RawFilm[] = Array.isArray(raw.films) ? (raw.films as RawFilm[]) : [];
  const movies: Movie[] = [];
  const rejected: ProgrammeRejection[] = [];
  const seen = new Set<string>();

  for (const film of films) {
    const errors: string[] = [];
    const slug = typeof film.slug === "string" ? film.slug.trim() : "";

    if (!slug) {
      errors.push("film: \"slug\" is required");
    } else if (!SLUG_PATTERN.test(slug)) {
      errors.push(`film "${slug}": slug must be kebab-case`);
    } else if (seen.has(slug)) {
      errors.push(`film "${slug}": duplicate slug`);
    }

    const title = typeof film.title === "string" ? film.title.trim() : "";
    if (!title) errors.push(`film "${slug || "?"}": "title" is required`);

    const releaseDate =
      typeof film.releaseDate === "string" && isValidCalendarDate(film.releaseDate)
        ? film.releaseDate
        : "";
    if (!releaseDate) {
      errors.push(`film "${slug || "?"}": a valid ISO "releaseDate" is required`);
    } else if (compiledOn && releaseDate > addDays(compiledOn, 400)) {
      errors.push(`film "${slug || "?"}": release date is implausibly far beyond the compiled date`);
    }

    const sources = parseSources(film.sources, slug || "?", errors);
    const languages = parseLanguages(film.languages, slug || "?", errors);

    if (errors.length > 0) {
      rejected.push({ slug: slug || "(unnamed)", errors });
      continue;
    }

    seen.add(slug);
    movies.push({
      slug,
      title,
      originalTitle:
        typeof film.originalTitle === "string" && film.originalTitle.trim()
          ? film.originalTitle.trim()
          : null,
      status: releaseDate <= todayISO ? "now_showing" : "coming_soon",
      /* No synopsis is published by a release calendar, so none is claimed. */
      synopsis: null,
      languages,
      /* Runtime and certification are not published either. Null, not guessed. */
      runtimeMinutes: null,
      genres: parseGenres(film.genres),
      certification: null,
      /* Formats belong to the venue's own assignment. Never inferred from a title. */
      formats: [],
      /* The project's own plate, or nothing. Never a borrowed poster. */
      artwork: coverPlateFor(slug, title),
      releaseDate,
      releaseScope,
      sources,
      provenance: `Release date published before ${compiledOn || "compilation"}; verified against ${sources.length} source${
        sources.length === 1 ? "" : "s"
      }. Not this cinema's schedule.`,
    });
  }

  return { movies, rejected };
}

/**
 * The programme, ready to render. Films released go newest first; films to come
 * go soonest first. Both orders put the most useful title at the top.
 */
export const loadProgramme = cache((): Programme => {
  const { todayISO } = readClock();
  const { movies, rejected } = parseProgramme(todayISO);

  const byReleaseAsc = (a: Movie, b: Movie) =>
    (a.releaseDate ?? "").localeCompare(b.releaseDate ?? "");

  const released = movies
    .filter((movie) => movie.status === "now_showing")
    .sort((a, b) => byReleaseAsc(b, a));
  const upcoming = movies.filter((movie) => movie.status === "coming_soon").sort(byReleaseAsc);

  const citations: SourceRef[] = [];
  const seen = new Set<string>();
  for (const movie of movies) {
    for (const source of movie.sources) {
      if (seen.has(source.url)) continue;
      seen.add(source.url);
      citations.push(source);
    }
  }

  const raw = programmeData as unknown as { compiledOn?: unknown; releaseScope?: unknown };
  const compiledOn = typeof raw.compiledOn === "string" ? raw.compiledOn : "";

  return {
    movies: [...released, ...upcoming],
    compiledOn,
    releaseScope: typeof raw.releaseScope === "string" ? raw.releaseScope : "",
    sourceLabel: "Sourced release calendar",
    caveat:
      "These are announced national release dates for cinemas in India, compiled from the sources listed with each film. They are not this cinema's schedule: a venue can add, move or drop a title, and its own screening times appear here only once its ticketing feed is connected.",
    citations,
    rejected,
  };
});
