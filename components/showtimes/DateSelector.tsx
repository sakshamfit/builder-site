import Link from "next/link";
import { buildHref, type FilterParams } from "@/lib/share-url";
import type { DateOption } from "@/lib/showtime-view";
import styles from "./showtimes.module.css";

/**
 * Date selector.
 *
 * Rendered as a list of links rather than a JavaScript tab widget. Each date is
 * a real URL, so a chosen date can be shared, bookmarked, opened in a new tab
 * and reached with the back button — and it works with JavaScript disabled.
 *
 * `aria-current="date"` marks the selection, which is the correct semantic for
 * a date picker and announces as "current date" rather than relying on colour.
 */
export function DateSelector({
  options,
  selected,
  basePath,
  filters,
}: {
  options: DateOption[];
  selected: string;
  basePath: string;
  filters: FilterParams;
}) {
  if (options.length === 0) return null;

  return (
    <nav className={styles.dateNav} aria-label="Choose a date">
      <ul className={styles.dateStrip}>
        {options.map((option) => {
          const isSelected = option.dateISO === selected;

          return (
            <li key={option.dateISO}>
              <Link
                href={buildHref(basePath, { ...filters, date: option.dateISO })}
                className={styles.dateChip}
                aria-current={isSelected ? "date" : undefined}
                aria-label={option.ariaLabel}
              >
                <span className={styles.dateChipWeekday} aria-hidden="true">
                  {option.weekday}
                </span>
                <span className={styles.dateChipDay} aria-hidden="true">
                  {option.day}
                </span>
                <span className={styles.dateChipMonth} aria-hidden="true">
                  {option.month}
                </span>
                {option.relativeLabel ? (
                  <span className={styles.dateChipRelative} aria-hidden="true">
                    {option.relativeLabel}
                  </span>
                ) : null}
                <span className={styles.dateChipCount} aria-hidden="true">
                  {option.hasShowtimes
                    ? `${option.count} show${option.count === 1 ? "" : "s"}`
                    : "none"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
