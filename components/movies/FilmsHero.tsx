import { TiltedGridHero } from "@/components/ui/tilted-grid-hero";
import type { Movie } from "@/lib/types";

/**
 * The films band at the top of the programme.
 *
 * Its images are the films' own artwork records (`Movie.artwork`), which are
 * only ever the original cover plates or a licensed file the venue supplies.
 * A film with no artwork is left out of the band rather than filled with a
 * stand-in, so this never shows a studio poster.
 *
 * Layout lives in app/globals.css (`.films-hero*`): on wide screens the copy
 * sits in a panel over the band; on phones the copy stacks above the band so
 * the curved row is never hidden behind it.
 */
export function FilmsHero({
  movies,
  total,
  released,
  upcoming,
}: {
  movies: Movie[];
  total: number;
  released: number;
  upcoming: number;
}) {
  const images = movies.flatMap((movie) =>
    movie.artwork ? [{ src: movie.artwork.url, alt: movie.artwork.alt }] : [],
  );

  const copy = (
    <>
      <span className="eyebrow">Programme</span>
      <h1 id="films-title">Films</h1>
      <p>
        {total} film{total === 1 ? "" : "s"} — {released} in cinemas, {upcoming} announced. Every
        release date is taken from a published release calendar and cited on the film, so you can
        check any of them.
      </p>
    </>
  );

  if (images.length === 0) {
    return (
      <section className="wrap scene-pad" aria-labelledby="films-title">
        <div className="section-head">
          <div>{copy}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="films-hero" aria-labelledby="films-title">
      <div className="films-hero__band">
        <TiltedGridHero images={images} speed={4} style={{ height: "100%", width: "100%" }} />
      </div>
      <div className="films-hero__copy">
        {/* A paper panel keeps the copy legible over whichever plates pass behind it. */}
        <div className="films-hero__panel">{copy}</div>
      </div>
    </section>
  );
}
