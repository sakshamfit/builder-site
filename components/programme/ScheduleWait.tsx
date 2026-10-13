import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site-config";
import styles from "./programme.module.css";

/**
 * Where the timetable sits until the cinema's own timetable is connected.
 *
 * Screening times can only come from the venue's ticketing system. Until that is
 * connected there is no honest way to say when a film plays, so this section
 * states the position once — plainly, in the venue's voice, without apologising
 * for it — and then gets out of the way of the programme, which is real.
 *
 * It is deliberately not a warning. Nothing is broken; a connection has not been
 * made yet, and there is a difference between those two things on a site whose
 * whole point is not overstating what it knows.
 */
export function ScheduleWait({
  variant,
  title = "Screening times for this cinema",
  reason,
}: {
  /** "home" is the compact version under the programme; "page" is full width. */
  variant: "home" | "page";
  title?: string;
  /** Set when a feed exists but is currently unreadable, instead of never having been connected. */
  reason?: string | null;
}) {
  const providerName = siteConfig.ticketing.providerName;

  return (
    <div className={`${styles.wait} ${variant === "home" ? styles.waitHome : ""}`}>
      <div className={styles.waitHead}>
        <span className={styles.waitKicker}>Tickets and times</span>
        <h3 className={styles.waitTitle}>{title}</h3>
        <p className={styles.waitLede}>
          {reason ??
            "The cinema's timetable comes here from its own ticketing system once the venue connects it. Until then this site lists no times, prices or seat availability, and invents none. The programme above is the part that is already complete: real films, published release dates, each one cited."}
        </p>
      </div>

      <dl className={styles.waitFacts}>
        <div className={styles.waitFact}>
          <dt>Already here</dt>
          <dd>
            The film programme: every released and announced title with its published release date
            and the sources it came from.
          </dd>
        </div>
        <div className={styles.waitFact}>
          <dt>With the venue</dt>
          <dd>
            Dates, times, screens, formats and seat prices for this cinema. Those are a venue&rsquo;s
            own operational facts, and only the venue can supply them.
          </dd>
        </div>
        <div className={styles.waitFact}>
          <dt>Where tickets come from</dt>
          <dd>
            {providerName
              ? `The venue's ticketing partner, ${providerName}. This site never handles payment or seat selection.`
              : "The venue's ticketing partner. This site never handles payment or seat selection, and a ticket link appears here only once a confirmed provider is configured."}
          </dd>
        </div>
      </dl>

      <div className={styles.waitActions}>
        <Button href="/cinema" variant="outline" size="small">
          Venue and directions
        </Button>
        <Button href="/help" variant="ghost" size="small">
          How booking will work
        </Button>
      </div>
    </div>
  );
}
