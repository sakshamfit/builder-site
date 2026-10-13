import { Badge } from "@/components/ui/Badge";
import { scheduleFreshness } from "@/lib/date-format";
import { siteConfig } from "@/lib/site-config";
import styles from "./showtimes.module.css";

/**
 * Schedule provenance line.
 *
 * A visitor is entitled to know how current a timetable is, and whether it is
 * real. This states both: where the data came from and when it was produced.
 * The freshness treatment escalates to plain advice once a snapshot goes stale
 * rather than quietly presenting old times as current.
 */
export function ScheduleStatus({
  lastUpdated,
  sourceLabel,
  notice,
  nowISO,
}: {
  lastUpdated: string | null;
  sourceLabel: string;
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
            <strong>Sample data.</strong> {notice}
          </span>
        </p>
      ) : null}

      <p className={styles.statusRow}>
        <Badge tone={siteConfig.isFixtureMode ? "amber" : "ok"}>
          {siteConfig.isFixtureMode ? "Development" : "Live schedule"}
        </Badge>
        <span>{sourceLabel}</span>
        {updatedLabel ? <span aria-hidden="true">·</span> : null}
        {updatedLabel ? <span>{updatedLabel}</span> : null}
        {freshness.level === "stale" && !siteConfig.isFixtureMode ? (
          <span>
            Times may have changed since — please confirm with the cinema before travelling.
          </span>
        ) : null}
      </p>
    </div>
  );
}
