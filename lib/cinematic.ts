/**
 * The cinematic home page — its pre-paint switch and the facts its scenes read.
 *
 * The scenes themselves are adapted from the owner's `gireeshkumarreddy/pk`
 * repository (ASSET_CREDITS.md §11). What they *say* is not: every number,
 * date, language and title shown in them is derived here from the same
 * programme record the rest of the site renders, so a scene cannot claim
 * something the film pages contradict.
 */

import coverArtData from "@/data/cover-art.json";
import { PLAYBACK_ATTRIBUTE, PLAYBACK_STORAGE_KEY } from "@/lib/playback";
import type { Movie } from "@/lib/types";

/* -------------------------------------------------------------------------- */
/* Pre-paint                                                                   */
/* -------------------------------------------------------------------------- */

/** Present on <html> only while the opening intro is playing. */
export const INTRO_ATTRIBUTE = "data-intro";
/** sessionStorage key: the intro plays once per visit, not on every return to home. */
export const INTRO_STORAGE_KEY = "cinema-at-madhuban:intro";
/** The intro's whole length. The CSS keyframes in intro.module.css end with it. */
export const INTRO_DURATION_MS = 2600;

/**
 * The cinematic pre-paint script, run inline beside the appearance bootstrap.
 *
 * It does two things before anything is drawn:
 *   1. restores a reader's "pause films" choice, so no loop starts and stops;
 *   2. on the home page only, on the first load of a visit, and never for a
 *      reader who asks for reduced motion, starts the opening intro — which is
 *      CSS from there on, and removes itself after INTRO_DURATION_MS or on the
 *      first key, tap, click or scroll, whichever comes first.
 *
 * Like the appearance bootstrap it must never throw: every failure falls
 * through to a page with no intro and the films playing, which is a page that
 * works. Without JavaScript none of it runs, and the intro never appears.
 */
export const CINEMATIC_BOOTSTRAP = [
  "(function(){try{var d=document.documentElement;",
  `try{if(window.localStorage.getItem(${JSON.stringify(PLAYBACK_STORAGE_KEY)})==="paused")d.setAttribute(${JSON.stringify(PLAYBACK_ATTRIBUTE)},"paused");}catch(e){}`,
  'if(location.pathname!=="/"||/[?&]showcase=1/.test(location.search))return;',
  'if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;',
  `var k=${JSON.stringify(INTRO_STORAGE_KEY)},seen=null;`,
  'try{seen=window.sessionStorage.getItem(k);window.sessionStorage.setItem(k,"1");}catch(e){}',
  "if(seen)return;",
  `var a=${JSON.stringify(INTRO_ATTRIBUTE)};d.setAttribute(a,"play");`,
  "var end=function(){d.removeAttribute(a);};",
  `setTimeout(end,${INTRO_DURATION_MS});`,
  '["keydown","pointerdown","wheel","touchstart"].forEach(function(t){window.addEventListener(t,end,{once:true,passive:true});});',
  "}catch(e){}})();",
].join("");

/* -------------------------------------------------------------------------- */
/* Plates                                                                      */
/* -------------------------------------------------------------------------- */

const PLATES = new Set<string>(
  Array.isArray((coverArtData as { plates?: unknown }).plates)
    ? (coverArtData as { plates: unknown[] }).plates.filter((slug): slug is string => typeof slug === "string")
    : [],
);

/** A decorative plate by slug. Only plates the manifest declares can be returned. */
export function plateSrc(slug: string): string | null {
  return PLATES.has(slug) ? `/cover-art/${slug}.jpg` : null;
}

/**
 * The plates that ring the centre of the opening sequence, in the order they
 * sit around it. Chosen for contrast with their neighbours — a cream plate
 * between two dark ones — not for the films they belong to: in the orbit they
 * are decoration, and are hidden from assistive technology as such.
 */
const ORBIT = [
  "frozen-iii",
  "jailer-2",
  "coco-2",
  "nayyi-navelli",
  "cult",
  "street-fighter",
  "ranabaali",
  "the-cat-in-the-hat",
  "tu-hai-meri-kiran",
  "klara-and-the-sun",
];

/** The five plates in the dark "season" scene. */
const CONSTELLATION = [
  "godzilla-minus-zero",
  "doraemon-castle-of-the-undersea-devil",
  "i-play-rocky",
  "wildwood",
  "pehla-pyaar-doosri-baar",
];

export type OrbitTile = { src: string; x: number; y: number; width: number };

/**
 * Tiles evenly around a ring, starting at twelve o'clock — the arrangement and
 * the 43% radius are pk's. Positions are percentages of a square stage.
 */
export function orbitTiles(): OrbitTile[] {
  const sources = ORBIT.map(plateSrc).filter((src): src is string => Boolean(src));
  return sources.map((src, index) => {
    const angle = (index / sources.length) * Math.PI * 2 - Math.PI / 2;
    return {
      src,
      x: Number((50 + Math.cos(angle) * 43).toFixed(3)),
      y: Number((50 + Math.sin(angle) * 43).toFixed(3)),
      width: index % 3 === 0 ? 15 : 12,
    };
  });
}

export function constellationTiles(): string[] {
  return CONSTELLATION.map(plateSrc).filter((src): src is string => Boolean(src));
}

/* -------------------------------------------------------------------------- */
/* Facts the scenes state                                                      */
/* -------------------------------------------------------------------------- */

export type LanguageCount = { label: string; films: number };

/** Every language in the programme, most-represented first. */
export function programmeLanguages(movies: Movie[]): LanguageCount[] {
  const counts = new Map<string, number>();
  for (const movie of movies) {
    for (const language of movie.languages) {
      counts.set(language.label, (counts.get(language.label) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([label, films]) => ({ label, films }))
    .sort((a, b) => b.films - a.films || a.label.localeCompare(b.label));
}

/** The first and last release dates in the programme, as ISO dates. */
export function programmeSpan(movies: Movie[]): { first: string; last: string } | null {
  const dates = movies
    .map((movie) => movie.releaseDate)
    .filter((date): date is string => Boolean(date))
    .sort();
  if (dates.length === 0) return null;
  return { first: dates[0], last: dates[dates.length - 1] };
}

/**
 * The films the chapters feature: the releases opening soonest, then the most
 * recent releases if fewer than three are still to come. Only films with a
 * cover plate or licensed artwork, because a chapter is a picture first.
 */
export function featuredFilms(movies: Movie[], count = 3): Movie[] {
  const withArt = movies.filter((movie) => movie.artwork);
  const upcoming = withArt
    .filter((movie) => movie.status === "coming_soon")
    .sort((a, b) => (a.releaseDate ?? "").localeCompare(b.releaseDate ?? ""));
  const released = withArt
    .filter((movie) => movie.status === "now_showing")
    .sort((a, b) => (b.releaseDate ?? "").localeCompare(a.releaseDate ?? ""));
  return [...upcoming, ...released].slice(0, count);
}

/** "Hindi", "Hindi and English", "Hindi, English and Nepali". */
export function listLabels(labels: string[]): string {
  if (labels.length <= 1) return labels[0] ?? "";
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}
