import Image from "next/image";
import Link from "next/link";
import { listLabels } from "@/lib/cinematic";
import { formatDateLong } from "@/lib/date-format";
import type { Movie } from "@/lib/types";
import styles from "./cinematic.module.css";

/**
 * Film chapters — three films from the programme, each given the full width.
 *
 * Adapted from the `.films` chapters in the owner's `gireeshkumarreddy/pk`
 * repository (ASSET_CREDITS.md §11): an oversized title that overlaps the top of
 * a wide picture and drifts against it, the picture settling from slightly
 * smaller as it arrives. Upstream's chapters are clips from one film and open a
 * YouTube trailer; these are three different films from the sourced programme,
 * and each one opens that film's own page — the place where its release date
 * and the source for it are shown.
 *
 * The picture is the film's cover plate, shown whole and sharp beside a blurred,
 * enlarged copy of itself that fills the frame — so a portrait plate can carry a
 * landscape banner without being cropped or stretched — and it says what it is.
 */
export function FilmChapters({ films, todayISO }: { films: Movie[]; todayISO: string }) {
  if (films.length === 0) return null;

  return (
    <section
      className={styles.films}
      data-scene="films"
      data-tone="dark"
      data-mode="night"
      aria-labelledby="films-title"
    >
      <div className={styles.filmsInner}>
        <div className={styles.filmsLabel}>
          <h2 id="films-title" className={styles.filmsHeading}>
            Opening next
          </h2>
          <span>{films.length === 1 ? "One film" : `${films.length} films`} from the programme</span>
        </div>

        {films.map((film, index) => {
          const plate = film.artwork?.url.startsWith("/cover-art/") ?? false;
          const released = film.status === "now_showing" || (film.releaseDate ?? "9999") <= todayISO;
          const date = film.releaseDate ? formatDateLong(film.releaseDate) : null;
          return (
            <article
              key={film.slug}
              className={styles.chapter}
              data-j="chapter"
              data-side={index % 2 === 0 ? "right" : "left"}
              aria-labelledby={`chapter-${film.slug}`}
            >
              <p className={styles.chapterTop}>
                <span className={styles.chapterIndex}>{String(index + 1).padStart(2, "0")}</span>
                <span>{date ? `${released ? "Released" : "Releasing"} ${date}` : "Date to be announced"}</span>
                <span className={styles.chapterLanguages}>{listLabels(film.languages.map((l) => l.label))}</span>
              </p>

              <h3 className={styles.chapterTitle} id={`chapter-${film.slug}`} data-j="chapterTitle">
                {film.title}
              </h3>

              <Link href={`/movies/${film.slug}`} className={styles.chapterBanner} data-j="banner">
                {film.artwork ? (
                  <>
                    <span className={styles.chapterAmbient} aria-hidden="true">
                      <Image src={film.artwork.url} alt="" fill sizes="160px" />
                    </span>
                    <span className={styles.chapterPlate}>
                      <Image src={film.artwork.url} alt={film.artwork.alt} fill sizes="(max-width: 700px) 46vw, 300px" />
                    </span>
                  </>
                ) : null}
                <span className={styles.chapterSweep} aria-hidden="true" />
                <span className={styles.chapterCta}>
                  View the film <span aria-hidden="true">→</span>
                </span>
              </Link>

              <div className={styles.chapterCaption}>
                <p>{film.genres.length ? film.genres.join(" · ") : "Genre not yet published"}</p>
                <span className={styles.chapterCredit}>
                  {plate ? "Original cover art, not the film\u2019s poster" : film.artwork?.licence}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
