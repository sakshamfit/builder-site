/**
 * Language labels.
 *
 * Screenings carry a BCP-47-ish code; the display label comes from the film
 * record, which is the only place the venue or the release source has spelled it
 * out. Falling back to the uppercased code keeps the UI honest — "PA" is worse
 * than "Punjabi" but far better than a guess at what "pa" means.
 */

import type { Movie } from "@/lib/types";

export function languageLabel(code: string, from: Movie[]): string {
  for (const movie of from) {
    const match = movie.languages.find((language) => language.code === code);
    if (match) return match.label;
  }
  return code.toUpperCase();
}
