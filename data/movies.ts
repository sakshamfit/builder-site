/**
 * SAMPLE FILM CATALOGUE — DEVELOPMENT FIXTURE. NOT REAL FILMS.
 *
 * Every title, synopsis, runtime and certification in this file is fictional
 * and was written for this project. No real film, studio, distributor or
 * performer is referenced, and no third-party artwork is used: the posters in
 * /public/posters are original abstract placeholder artwork generated for this
 * repository.
 *
 * This exists so the interface can be built and reviewed with realistic shapes.
 * The site labels it as sample data everywhere it appears, and no booking link
 * is ever produced from it (see lib/ticketing-provider.ts).
 *
 * Before launch: replace this module with the venue's approved catalogue and
 * licensed artwork, then update ASSET_CREDITS.md.
 */

import type { Movie } from "@/lib/types";

const FIXTURE_ARTWORK = "Poster: original abstract placeholder artwork generated for this project";

export const movies: Movie[] = [
  {
    slug: "lantern-keeper",
    title: "The Lantern Keeper",
    originalTitle: null,
    status: "now_showing",
    synopsis:
      "A retiring lighthouse keeper spends one last winter teaching his replacement that the light matters less than knowing when to switch it on.",
    languages: [
      { code: "hi", label: "Hindi" },
      { code: "en", label: "English" },
    ],
    runtimeMinutes: 128,
    genres: ["Drama"],
    certification: { label: "U/A 13+", body: "CBFC" },
    formats: ["2D"],
    posterPath: "/posters/lantern-keeper.jpg",
    posterAlt: "The Lantern Keeper poster: a lit brass lantern glowing in dark fog",
    releaseDate: null,
    rights: { artwork: FIXTURE_ARTWORK, copy: "Original sample synopsis written for this project" },
  },
  {
    slug: "monsoon-circuit",
    title: "Monsoon Circuit",
    originalTitle: null,
    status: "now_showing",
    synopsis:
      "A power-grid engineer working through the first night of the monsoon discovers that the outage she is chasing was scheduled months in advance.",
    languages: [{ code: "hi", label: "Hindi" }],
    runtimeMinutes: 134,
    genres: ["Thriller", "Crime"],
    certification: { label: "U/A 16+", body: "CBFC" },
    formats: ["2D"],
    posterPath: "/posters/monsoon-circuit.jpg",
    posterAlt: "Monsoon Circuit poster: rain on a dark window with blurred amber city lights",
    releaseDate: null,
    rights: { artwork: FIXTURE_ARTWORK, copy: "Original sample synopsis written for this project" },
  },
  {
    slug: "nightshift-at-zero",
    title: "Nightshift at Zero",
    originalTitle: null,
    status: "now_showing",
    synopsis:
      "Two technicians alone on a decommissioned floor start receiving maintenance requests from a wing of the building that was never built.",
    languages: [{ code: "en", label: "English" }],
    runtimeMinutes: 119,
    genres: ["Science Fiction", "Thriller"],
    certification: { label: "U/A 16+", body: "CBFC" },
    formats: ["2D", "3D"],
    posterPath: "/posters/nightshift-at-zero.jpg",
    posterAlt: "Nightshift at Zero poster: a long concrete corridor lit by one ceiling lamp",
    releaseDate: null,
    rights: { artwork: FIXTURE_ARTWORK, copy: "Original sample synopsis written for this project" },
  },
  {
    slug: "paper-boats",
    title: "Paper Boats",
    originalTitle: null,
    status: "now_showing",
    synopsis:
      "During one week of school holidays, a brother and sister turn a flooded lane into an ocean and quietly reorganise their family around it.",
    languages: [
      { code: "pa", label: "Punjabi" },
      { code: "hi", label: "Hindi" },
    ],
    runtimeMinutes: 106,
    genres: ["Drama", "Family"],
    certification: { label: "U", body: "CBFC" },
    formats: ["2D"],
    posterPath: "/posters/paper-boats.jpg",
    posterAlt: "Paper Boats poster: small white paper boats drifting on dark water",
    releaseDate: null,
    rights: { artwork: FIXTURE_ARTWORK, copy: "Original sample synopsis written for this project" },
  },
  {
    slug: "quiet-orbit",
    title: "Quiet Orbit",
    originalTitle: null,
    status: "now_showing",
    synopsis:
      "A survey crew on a nine-month loop around an empty world learn that the planet never was the point of the mission.",
    languages: [{ code: "en", label: "English" }],
    runtimeMinutes: 143,
    genres: ["Science Fiction", "Drama"],
    certification: { label: "U/A 13+", body: "CBFC" },
    formats: ["2D"],
    posterPath: "/posters/quiet-orbit.jpg",
    posterAlt: "Quiet Orbit poster: a thin ring of amber light glowing in darkness",
    releaseDate: null,
    rights: { artwork: FIXTURE_ARTWORK, copy: "Original sample synopsis written for this project" },
  },
  {
    slug: "harbour-lights",
    title: "Harbour Lights",
    originalTitle: null,
    status: "now_showing",
    synopsis:
      "Two strangers keep missing the last ferry home and keep deciding, every evening, that one more hour is worth it.",
    languages: [{ code: "hi", label: "Hindi" }],
    runtimeMinutes: 121,
    genres: ["Romance", "Drama"],
    certification: { label: "U/A 13+", body: "CBFC" },
    formats: ["2D"],
    posterPath: "/posters/harbour-lights.jpg",
    posterAlt: "Harbour Lights poster: harbour water reflecting warm lights at dusk",
    releaseDate: null,
    rights: { artwork: FIXTURE_ARTWORK, copy: "Original sample synopsis written for this project" },
  },
  {
    slug: "the-long-interval",
    title: "The Long Interval",
    originalTitle: null,
    status: "coming_soon",
    synopsis:
      "An ageing projectionist is asked to train the person who will replace him, and to hand over the one reel he has never screened.",
    languages: [{ code: "hi", label: "Hindi" }],
    runtimeMinutes: 117,
    genres: ["Drama"],
    certification: null,
    formats: ["2D"],
    posterPath: "/posters/the-long-interval.jpg",
    posterAlt: "The Long Interval poster: an empty vintage auditorium glowing softly",
    releaseDate: "2026-11-06",
    rights: { artwork: FIXTURE_ARTWORK, copy: "Original sample synopsis written for this project" },
  },
  {
    slug: "second-reel",
    title: "Second Reel",
    originalTitle: null,
    status: "coming_soon",
    synopsis:
      "A cinema's staff keep a broken projector running for one final weekend so a regular customer can finish a film he started in 1994.",
    languages: [
      { code: "en", label: "English" },
      { code: "hi", label: "Hindi" },
    ],
    runtimeMinutes: 99,
    genres: ["Comedy", "Drama"],
    certification: null,
    formats: ["2D"],
    posterPath: "/posters/second-reel.jpg",
    posterAlt: "Second Reel poster: a curling strip of 35mm film in warm light",
    releaseDate: "2026-11-20",
    rights: { artwork: FIXTURE_ARTWORK, copy: "Original sample synopsis written for this project" },
  },
  {
    slug: "static-and-stars",
    title: "Static and Stars",
    originalTitle: null,
    status: "coming_soon",
    synopsis:
      "A radio astronomer who has spent her career listening for a signal finally hears one, and cannot bring herself to answer it.",
    languages: [{ code: "en", label: "English" }],
    runtimeMinutes: 152,
    genres: ["Science Fiction", "Drama"],
    certification: null,
    formats: ["2D"],
    posterPath: "/posters/static-and-stars.jpg",
    posterAlt: "Static and Stars poster: faint stars crossed by a band of warm static",
    releaseDate: "2026-12-04",
    rights: { artwork: FIXTURE_ARTWORK, copy: "Original sample synopsis written for this project" },
  },
];

export const nowShowing: Movie[] = movies.filter((movie) => movie.status === "now_showing");
export const comingSoon: Movie[] = movies
  .filter((movie) => movie.status === "coming_soon")
  .sort((a, b) => (a.releaseDate ?? "").localeCompare(b.releaseDate ?? ""));

export function getMovieBySlug(slug: string): Movie | undefined {
  return movies.find((movie) => movie.slug === slug);
}

export function languageLabel(code: string, from: Movie[] = movies): string {
  for (const movie of from) {
    const match = movie.languages.find((language) => language.code === code);
    if (match) return match.label;
  }
  return code.toUpperCase();
}
