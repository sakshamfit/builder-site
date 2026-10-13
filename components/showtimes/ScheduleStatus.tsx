import { Badge } from "@/components/ui/Badge";
import { scheduleFreshness } from "@/lib/date-format";
import styles from "./showtimes.module.css";

/**
 * Schedule provenance line.
 *
 * A visitor is entitled to know how current a timetable is and where it came
 * from, so this states both: the source, and when the source produced the data.
 * The freshness treatment escalates to plain advice once a snapshot goes stale,
 * rather than quietly presenting old times as current.
 *
 * This component only ever renders beside a real feed's screenings. There is no
 * "sample data" state to warn about any more, because there is no sample data.
 */
export function ScheduleStatus({
  lastUpdated,
  sourceLabel,
  notice,
  nowISO,
}: {
  lastUpdated: string | null;
  sourceLabel: string;
  /** Non-fatal problem reported by the feed parser, e.g. dropped artwork. */
  notice: string | null;
  nowISO: string;
}) {
  const freshness = lastUpdated
    ? scheduleFreshness(lastUpdated, nowISO)
    : { level: "stale" as const, hours: Number.POSITIVE_INFINITY };

  const updatedLabel = (() => {
    if (!lastUpdated) return null;
    if (freshness.hours < 1) return "updated in the last hour";
    const hours = Math.round(freshness.hours);
    if (hours < 24) return `updated about ${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.round(hours / 24);
    return `last updated ${days} day${days === 1 ? "" : "s"} ago`;
  })();

  return (
    <div className={styles.status}>
      {notice ? (
        <p className="note">
          <span>
            <strong>From the venue feed.</strong> {notice}
          </span>
        </p>
      ) : null}

      <p className={styles.statusRow}>
        <Badge tone="ok">Venue feed</Badge>
        <span>{sourceLabel}</span>
        {updatedLabel ? <span aria-hidden="true">·</span> : null}
        {updatedLabel ? <span>{updatedLabel}</span> : null}
        {freshness.level === "stale" ? (
          <span>
            Times may have changed since — please confirm with the cinema before travelling.
          </span>
        ) : null}
      </p>
    </div>
  );
}
