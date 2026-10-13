import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PosterImage } from "@/components/ui/PosterImage";
import { ProgrammePlate } from "@/components/programme/ProgrammePlate";
import { ScheduleWait } from "@/components/programme/ScheduleWait";
import { Badge } from "@/components/ui/Badge";
import { ShowtimeBoard } from "@/components/showtimes/ShowtimeBoard";
import { readClock } from "@/lib/clock";
import { formatDateLong, formatRuntime, isValidCalendarDate } from "@/lib/date-format";
import { buildMetadata } from "@/lib/metadata";
import { getScheduleSnapshot } from "@/lib/schedule-source";
import { readFilterParams } from "@/lib/share-url";
import { findMovie, loadCatalogue } from "@/lib/catalogue";
import styles from "@/components/movies/movies.module.css";
import programmeStyles from "@/components/programme/programme.module.css";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/*
 * No `generateStaticParams` here, deliberately.
 *
 * A film page reads `searchParams` (the selected date) and shows a schedule that
 * changes through the day, so it is a dynamic route in both data modes. Declaring
 * static params — even an empty list — makes Next attempt on-demand static
 * generation for unknown slugs, and a static render may not read `searchParams`;
 * in live mode that surfaced as DYNAMIC_SERVER_USAGE and a 500 on the film page.
 *
 * Rendering on demand also means a visitor never sees a frozen schedule from an
 * earlier build.
 */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const catalogue = await loadCatalogue();
  const movie = findMovie(catalogue, slug);

  if (!movie || !catalogue.available) {
    return buildMetadata({
      title: "Film not found",
      description: "That film is not in this cinema's current programme.",
      path: `/movies/${slug}`,
      noIndex: true,
    });
  }

  const parts = [
    movie.languages.map((language) => language.label).join(" and "),
    movie.genres.slice(0, 2).join(" "),
    movie.releaseDate
      ? `${movie.status === "coming_soon" ? "releases" : "released"} ${formatDateLong(movie.releaseDate)}`
      : null,
    "at the cinema at Elante Mall, Chandigarh",
  ].filter(Boolean);

  return buildMetadata({
    title: movie.title,
    description: `${movie.title} — ${parts.join(", ")}.`,
    path: `/movies/${movie.slug}`,
    /* Social previews use the film's own artwork only when it is licensed. */
    imagePath: movie.artwork?.url,
  });
}

/**
 * One film.
 *
 * The record's own facts, in the record's own terms. A sourced release record
 * holds a title, languages, genres and an announced release date — so the page
 * shows those, cites where the date came from, and states plainly that screening
 * times at this cinema are a separate fact that only the venue's feed can supply.
 *
 * Where a synopsis, runtime, certification or licensed poster exists, each one
 * renders. Where it does not, the page is shorter. It is never filled in.
 */
export default async function MoviePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const catalogue = await loadCatalogue();

  if (!catalogue.available) notFound();
  const movie = findMovie(catalogue, slug);
  if (!movie) notFound();

  const { venue } = catalogue;

  const query = await searchParams;
  const clock = readClock();
  const snapshot = await getScheduleSnapshot();

  const requestedDate = readFilterParams(query).date;
  const dateISO =
    requestedDate && isValidCalendarDate(requestedDate) ? requestedDate : clock.todayISO;

  const runtime = formatRuntime(movie.runtimeMinutes);
  const released = movie.status === "now_showing";
  const languageList = movie.languages.map((language) => language.label).join(", ");
  const dateLabel = movie.releaseDate ? formatDateLong(movie.releaseDate) : null;

  const hasShowtimes =
    snapshot.state === "ready" &&
    snapshot.scheduleAvailable &&
    snapshot.showtimes.some((showtime) => showtime.movieSlug === movie.slug);

  return (
    <article className="wrap scene-pad">
      <p className="small muted" style={{ marginBottom: "1rem" }}>
        <Link href="/movies">← All films</Link>
      </p>

      <div className={styles.detail}>
        <div className={styles.detailBody}>
          <div className={styles.detailPoster}>
            {movie.artwork ? (
              <PosterImage
                src={movie.artwork.url}
                alt={movie.artwork.alt}
                sizes="(min-width: 720px) 15rem, 45vw"
                priority
              />
            ) : (
              <ProgrammePlate title={movie.title} slug={movie.slug} />
            )}
          </div>

          <div>
            <h1>{movie.title}</h1>

            {movie.originalTitle ? (
              <p className={programmeStyles.cardOriginal} style={{ marginTop: "0.5rem" }}>
                Also listed as {movie.originalTitle}
              </p>
            ) : null}

            <p className={`muted ${styles.cardMeta}`} style={{ marginTop: "0.6rem" }}>
              <span>
                {released ? "In cinemas" : "Releases"}
                {dateLabel ? ` — ${dateLabel}` : ""}
              </span>
              {languageList ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{languageList}</span>
                </>
              ) : null}
              {runtime ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{runtime}</span>
                </>
              ) : null}
              {movie.certification ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    {movie.certification.label}
                    <span className="visually-hidden"> certification, {movie.certification.body}</span>
                  </span>
                </>
              ) : null}
              {movie.genres.length > 0 ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{movie.genres.join(", ")}</span>
                </>
              ) : null}
            </p>

            {movie.formats.length > 0 ? (
              <p className={styles.cardBadges} style={{ marginTop: "0.6rem" }}>
                {movie.formats.map((format) => (
                  <Badge key={format} tone="plain">
                    {format}
                  </Badge>
                ))}
              </p>
            ) : null}

            {movie.synopsis ? (
              <p className="lede" style={{ marginTop: "1rem" }}>
                {movie.synopsis}
              </p>
            ) : null}

            {movie.releaseScope ? (
              <p className="small muted" style={{ marginTop: "1rem", maxWidth: "62ch" }}>
                {movie.releaseScope}. The date above is when this film opens in cinemas, not when
                this cinema is showing it — a venue can add, move or drop a title, and its own times
                appear on this page only once its ticketing feed is connected.
              </p>
            ) : null}

            {movie.sources.length > 0 ? (
              <details className={programmeStyles.sources} style={{ marginTop: "1.25rem" }}>
                <summary className={programmeStyles.sourcesSummary}>
                  Sources for this release date ({movie.sources.length})
                </summary>
                <ul className={programmeStyles.sourcesList}>
                  {movie.sources.map((source) => (
                    <li key={source.url}>
                      <a href={source.url} rel="nofollow noopener" target="_blank">
                        {source.label}
                      </a>
                    </li>
                  ))}
                </ul>
                <p className={programmeStyles.sourcesNote}>{movie.provenance}</p>
              </details>
            ) : (
              <p className="small muted" style={{ marginTop: "1.25rem" }}>
                {movie.provenance}
              </p>
            )}
          </div>
        </div>
      </div>

      {hasShowtimes && snapshot.state === "ready" ? (
        <section aria-labelledby="film-showtimes">
          <div className="section-head">
            <div>
              <span className="eyebrow">Dates and times</span>
              <h2 id="film-showtimes">{movie.title} showtimes</h2>
              <p>All screenings of this film at {venue.name}.</p>
            </div>
          </div>

          <ShowtimeBoard
            snapshot={snapshot}
            movies={catalogue.movies}
            venue={venue}
            dateISO={dateISO}
            todayISO={clock.todayISO}
            nowISO={clock.nowISO}
            basePath={`/movies/${movie.slug}`}
            filters={{}}
            onlySlug={movie.slug}
            showPosters={false}
            headingLevel={3}
          />
        </section>
      ) : (
        <section aria-labelledby="film-showtimes">
          <div className="section-head">
            <div>
              <span className="eyebrow">Dates and times</span>
              <h2 id="film-showtimes">Showtimes for {movie.title}</h2>
            </div>
          </div>
          <ScheduleWait
            variant="page"
            title={
              released
                ? "This cinema's times are not published yet"
                : "Tickets are not on sale for this film yet"
            }
            reason={
              released
                ? undefined
                : `This film is announced for release${dateLabel ? ` on ${dateLabel}` : ""}. Showtimes appear here once the cinema publishes them, and this site will not guess at dates.`
            }
          />
        </section>
      )}

      <p className="small muted" style={{ marginTop: "2.5rem" }}>
        <Link href="/movies">Browse every film in the programme</Link>
      </p>
    </article>
  );
}
