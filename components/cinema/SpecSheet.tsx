import { Badge } from "@/components/ui/Badge";
import type { Fact } from "@/lib/types";
import { pendingNote } from "@/lib/cinema-content";
import styles from "@/components/home/home.module.css";

export type SpecEntry = {
  id: string;
  label: string;
  /** Confirmed figure, set in display type. */
  value: string | null;
  /** What is outstanding, shown in place of a value. */
  pending: string;
  status: "confirmed" | "pending";
};

/**
 * The venue specification sheet.
 *
 * A ruled box of rows, each pairing a small uppercase label with either a
 * confirmed figure set in oversized display type or an explicit statement of what
 * is still being confirmed. The contrast between the two is the point: a visitor
 * can see at a glance which facts the venue has actually signed off.
 *
 * This is where the honesty system earns its keep as design rather than
 * obligation — the gaps are part of the composition, not hidden inside it.
 */
export function SpecSheet({
  title,
  entries,
  footnote,
}: {
  title: string;
  entries: SpecEntry[];
  footnote?: string;
}) {
  const confirmedCount = entries.filter((entry) => entry.status === "confirmed").length;

  return (
    <section className={styles.specSheet} aria-label={title}>
      <div className={styles.specHead}>
        <span className="eyebrow">{title}</span>
        <Badge tone={confirmedCount === entries.length ? "ok" : "amber"}>
          {confirmedCount} of {entries.length} confirmed
        </Badge>
      </div>

      <dl className={styles.specRows}>
        {entries.map((entry) => (
          <div className={styles.specRow} key={entry.id}>
            <dt className={styles.specLabel}>{entry.label}</dt>
            <dd>
              {entry.status === "confirmed" && entry.value !== null ? (
                <span className={styles.specValue}>{entry.value}</span>
              ) : (
                <span className={styles.specValuePending}>{entry.pending}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      {footnote ? <p className={styles.specNote}>{footnote}</p> : null}
    </section>
  );
}

/**
 * Builds spec rows from `Fact` records through the presentation helpers, so a row
 * can only ever display a value the venue confirmed. An unconfirmed fact renders
 * its explanation instead — the type makes that hard to get wrong.
 */
export function specFromFacts(
  rows: { id: string; label: string; fact: Fact<string>; pending?: string }[],
): SpecEntry[] {
  return rows.map(({ id, label, fact, pending }) => {
    const value = fact.status === "confirmed" ? (fact.value ?? null) : null;
    return {
      id,
      label,
      value,
      pending: pending ?? pendingNote(fact, "Awaiting venue confirmation"),
      status: value === null ? "pending" : "confirmed",
    };
  });
}
