import Link from "next/link";
import { PosterImage } from "@/components/ui/PosterImage";
import { ProgrammePlate } from "@/components/programme/ProgrammePlate";
import { formatDateLong } from "@/lib/date-format";
import type { Movie } from "@/lib/types";
import styles from "./programme.module.css";

/**
 * One film in the programme.
 *
 * Shows the facts the record actually holds and nothing else. A sourced release
 * record holds a title, its languages, its genres and an announced release date;
 * it holds no runtime, no certification, no synopsis and no artwork, so none of
 * those appear — the plate takes the artwork's place and the metadata row simply
 * gets shorter. That is the honest shape of the data, rendered honestly.
 *
 * The date is labelled with the word "releases" or "released", never "now
 * showing", because this card cannot know what this cinema is screening.
 */
export function ProgrammeCard({
  movie,
  headingLevel = 3,
}: {
  movie: Movie;
  headingLevel?: 2 | 3;
}) {
  const Heading = `h${headingLevel}` as "h2" | "h3";
  const released = movie.status === "now_showing";
  const dateLabel = movie.releaseDate ? formatDateLong(movie.releaseDate) : null;

  return (
    <article className={styles.card}>
      <div className={styles.cardArt}>
        {movie.artwork ? (
          <PosterImage
            className={styles.cardPoster}
            src={movie.artwork.url}
            alt={movie.artwork.alt}
            sizes="(min-width: 1000px) 22vw, (min-width: 640px) 30vw, 44vw"
          />
        ) : (
          <ProgrammePlate title={movie.title} slug={movie.slug} />
        )}
      </div>

      <div className={styles.cardBody}>
        <p className={styles.cardStatus}>
          {released ? "In cinemas" : "Releases"}
          {dateLabel ? <span className={styles.cardStatusDate}>{dateLabel}</span> : null}
        </p>

        <Heading className={styles.cardTitle}>
          <Link href={`/movies/${movie.slug}`} className={styles.cardLink}>
            {movie.title}
          </Link>
        </Heading>

        {movie.originalTitle ? (
          <p className={styles.cardOriginal}>Also listed as {movie.originalTitle}</p>
        ) : null}

        <p className={styles.cardMeta}>
          {movie.languages.map((language) => (
            <span key={language.code}>{language.label}</span>
          ))}
          {movie.genres.length > 0 ? (
            <span className={styles.cardGenres}>{movie.genres.join(" · ")}</span>
          ) : null}
        </p>

        {movie.runtimeMinutes || movie.certification ? (
          <p className={styles.cardMeta}>
            {movie.certification ? <span>{movie.certification.label}</span> : null}
          </p>
        ) : null}
      </div>
    </article>
  );
}
