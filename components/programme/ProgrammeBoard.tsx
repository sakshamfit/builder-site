import type { ReactNode } from "react";
import { ProgrammeCard } from "@/components/programme/ProgrammeCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Movie } from "@/lib/types";
import styles from "./programme.module.css";

/**
 * The film programme.
 *
 * This section is the site's answer to "what films are on", and the answer has
 * to be exact about which question it is answering. The titles and release dates
 * are real and sourced; whether this cinema is screening them, and when, is not
 * known — so the board says that once, plainly, at the top, and each film card
 * carries its own release date and its own citation trail.
 *
 * `released` and `upcoming` are rendered as separate lists so a visitor never has
 * to work out which films they could actually go and see this week.
 */
export function ProgrammeBoard({
  movies,
  caveat,
  citations,
  showCitations = true,
}: {
  movies: Movie[];
  /** The honest statement of what this data is and is not. */
  caveat: string | null;
  /** Sources behind the release dates, shown as a footnote. */
  citations: { label: string; url: string }[];
  showCitations?: boolean;
}) {
  const released = movies.filter((movie) => movie.status === "now_showing");
  const upcoming = movies.filter((movie) => movie.status === "coming_soon");

  if (movies.length === 0) {
    return (
      <EmptyState title="No films are listed yet">
        <p>
          The programme has not been published. Nothing is shown rather than a placeholder list,
          because a film that is not really on is worse than no film at all.
        </p>
      </EmptyState>
    );
  }

  return (
    <div className={styles.board}>
      {caveat ? (
        <p className={styles.caveat}>
          <span className={styles.caveatMark} aria-hidden="true">
            i
          </span>
          <span>{caveat}</span>
        </p>
      ) : null}

      {released.length > 0 ? (
        <Group
          id="released"
          title="Recently released"
          note="Announced as released in cinemas. Each film carries its own release date."
        >
          {released.map((movie) => (
            <ProgrammeCard key={movie.slug} movie={movie} />
          ))}
        </Group>
      ) : null}

      {upcoming.length > 0 ? (
        <Group id="upcoming" title="Releasing soon" note="Announced dates. Dates can move.">
          {upcoming.map((movie) => (
            <ProgrammeCard key={movie.slug} movie={movie} />
          ))}
        </Group>
      ) : null}

      {showCitations && citations.length > 0 ? (
        <details className={styles.sources}>
          <summary className={styles.sourcesSummary}>
            Where these release dates came from ({citations.length} sources)
          </summary>
          <ul className={styles.sourcesList}>
            {citations.map((citation) => (
              <li key={citation.url}>
                <a href={citation.url} rel="nofollow noopener" target="_blank">
                  {citation.label}
                </a>
              </li>
            ))}
          </ul>
          <p className={styles.sourcesNote}>
            Release dates are compiled from published release calendars. They are not supplied by
            the cinema, and they are not this cinema&rsquo;s own schedule.
          </p>
        </details>
      ) : null}
    </div>
  );
}

function Group({
  id,
  title,
  note,
  children,
}: {
  id: string;
  title: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.group} aria-labelledby={`programme-${id}`}>
      <div className={styles.groupHead}>
        <h2 className={styles.groupTitle} id={`programme-${id}`}>
          {title}
        </h2>
        <p className={styles.groupNote}>{note}</p>
      </div>
      <ul className={styles.grid}>{children}</ul>
    </section>
  );
}

/**
 * A link onward to the full programme, used where the board is a preview.
 * Renders a div rather than a paragraph so it can sit inside a layout block
 * without nesting block elements.
 */
export function ProgrammeFooterLink({ count }: { count: number }) {
  return (
    <div className={styles.more}>
      <Button href="/movies" variant="outline" size="small">
        Every film in the programme ({count}) <span aria-hidden="true">→</span>
      </Button>
    </div>
  );
}
