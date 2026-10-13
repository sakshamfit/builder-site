import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site-config";
import styles from "./programme.module.css";

/**
 * The state of the timetable when there is no timetable.
 *
 * Screening times can only come from the venue's own ticketing feed. Until that
 * feed is connected there is no honest way to show when a film plays, so this
 * section says exactly that — what is missing, why, and what a visitor can do
 * instead — rather than rendering an empty grid or a placeholder time.
 *
 * This is the state most visitors to a pre-launch build will see, so it is
 * designed rather than tolerated: a bordered panel, a labelled list of the
 * facts that *are* known, and a route onward that leads somewhere real.
 */
export function ScheduleWait({
  variant,
  title = "Screening times are not connected yet",
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
            "This site publishes screening times only when the cinema's own ticketing feed supplies them. That feed is not connected to this build, so there are no times to show — and there is no version of this page that invents them."}
        </p>
      </div>

      <dl className={styles.waitFacts}>
        <div className={styles.waitFact}>
          <dt>What you can see</dt>
          <dd>
            The film programme: real titles with their announced release dates, in cinemas and
            coming up.
          </dd>
        </div>
        <div className={styles.waitFact}>
          <dt>What is missing</dt>
          <dd>
            Dates, times, screens, formats and prices at this cinema. These are the venue&rsquo;s
            own operational data.
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
