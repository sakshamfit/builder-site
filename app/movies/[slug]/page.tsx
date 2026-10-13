import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PosterImage } from "@/components/ui/PosterImage";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ShowtimeBoard } from "@/components/showtimes/ShowtimeBoard";
import { readClock } from "@/lib/clock";
import { formatDateLong, formatRuntime, isValidCalendarDate } from "@/lib/date-format";
import { buildMetadata } from "@/lib/metadata";
import { getScheduleSnapshot } from "@/lib/schedule-source";
import { readFilterParams } from "@/lib/share-url";
import { getMovieBySlug, movies } from "@/data/movies";
import { venue } from "@/data/cinema";
import { siteConfig } from "@/lib/site-config";
import styles from "@/components/movies/movies.module.css";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return movies.map((movie) => ({ slug: movie.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const movie = getMovieBySlug(slug);

  if (!movie) {
    return buildMetadata({
      title: "Film not found",
      description: "That film is not in this cinema's current programme.",
      path: `/movies/${slug}`,
      noIndex: true,
    });
  }

  const parts = [
    movie.languages.map((language) => language.label).join(" and "),
    formatRuntime(movie.runtimeMinutes),
    `${movie.status === "coming_soon" ? "coming soon" : "showtimes"}`,
  ].filter(Boolean);

  return buildMetadata({
    title: movie.title,
    description: `${movie.title} at ${siteConfig.brandName} — ${parts.join(", ")}.`,
    path: `/movies/${movie.slug}`,
    imagePath: movie.posterPath,
  });
}

/**
 * One film.
 *
 * Poster, the facts the record actually holds, the synopsis, then the dates and
 * times for this film at this venue. A coming-soon title deliberately gets no
 * showtime board — there is nothing on sale, and a date picker with no results
 * would be noise.
 */
export default async function MoviePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const movie = getMovieBySlug(slug);

  if (!movie) notFound();

  const query = await searchParams;
  const clock = readClock();
  const snapshot = await getScheduleSnapshot();

  const requestedDate = readFilterParams(query).date;
  const dateISO =
    requestedDate && isValidCalendarDate(requestedDate) ? requestedDate : clock.todayISO;

  const runtime = formatRuntime(movie.runtimeMinutes);
  const isComingSoon = movie.status === "coming_soon";
  const languageList = movie.languages.map((language) => language.label).join(", ");

  return (
    <article className="wrap scene-pad">
      <p className="small muted" style={{ marginBottom: "1rem" }}>
        <Link href="/movies">← All films</Link>
      </p>

      <div className={styles.detail}>
        <div className={styles.detailBody}>
          <div className={styles.detailPoster}>
            <PosterImage
              src={movie.posterPath}
              alt={movie.posterAlt}
              sizes="(min-width: 720px) 15rem, 45vw"
              priority
            />
          </div>

          <div>
            <h1>{movie.title}</h1>

            <p className={`muted ${styles.cardMeta}`} style={{ marginTop: "0.6rem" }}>
              <span>{languageList}</span>
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

            <p className="lede" style={{ marginTop: "1rem" }}>
              {movie.synopsis}
            </p>

            {isComingSoon ? (
              <p style={{ marginTop: "1rem" }}>
                <Badge tone="amber">Coming soon</Badge>{" "}
                {movie.releaseDate
                  ? `Scheduled from ${formatDateLong(movie.releaseDate)}. Times are published once the film is on sale.`
                  : "A release date has not been confirmed yet."}
              </p>
            ) : null}

            {siteConfig.isFixtureMode ? (
              <p className="small muted" style={{ marginTop: "1rem" }}>
                Sample catalogue entry — {movie.rights.artwork}. {movie.rights.copy}.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {isComingSoon ? (
        <EmptyState title="Tickets are not on sale for this film yet">
          <p>
            Showtimes appear here as soon as the cinema publishes them. Until then there is nothing
            to book, and this site will not guess at dates.
          </p>
          <Button href="/movies" variant="outline" size="small">
            See what is on now
          </Button>
        </EmptyState>
      ) : (
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
            movies={movies}
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
      )}

      <p className="small muted" style={{ marginTop: "2.5rem" }}>
        <Link href="/movies">Browse every film in the programme</Link>
      </p>
    </article>
  );
}
