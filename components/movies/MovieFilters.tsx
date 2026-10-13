import Link from "next/link";
import { buildHref, type FilterParams } from "@/lib/share-url";
import styles from "./movies.module.css";

type Option = { value: string; label: string; count: number };

/**
 * Language and format filters.
 *
 * The options are derived from the current schedule and catalogue — a filter is
 * only offered when something actually matches it. Each option is a link, so
 * filtering works without JavaScript, survives a refresh, and can be shared.
 */
export function MovieFilters({
  languages,
  formats,
  selected,
  basePath,
  filters,
  resultCount,
  totalCount,
}: {
  languages: Option[];
  formats: Option[];
  selected: FilterParams;
  basePath: string;
  filters: FilterParams;
  resultCount: number;
  totalCount: number;
}) {
  const hasFilters = Boolean(selected.language || selected.format);
  if (languages.length === 0 && formats.length === 0) return null;

  function pill(
    group: "language" | "format",
    value: string | null,
    label: string,
    count: number,
  ) {
    const isSelected = (selected[group] ?? null) === value;
    const next: FilterParams = { ...filters };
    if (value === null) delete next[group];
    else next[group] = value;

    return (
      <li key={`${group}-${value ?? "all"}`}>
        <Link
          href={buildHref(basePath, next)}
          className={styles.filterPill}
          aria-current={isSelected ? "true" : undefined}
        >
          <span>{label}</span>
          <span className={styles.filterCount}>{count}</span>
          {isSelected ? <span className="visually-hidden"> (selected)</span> : null}
        </Link>
      </li>
    );
  }

  const languageTotal = languages.reduce((sum, option) => sum + option.count, 0);
  const formatTotal = formats.reduce((sum, option) => sum + option.count, 0);

  return (
    <nav className={styles.filters} aria-label="Filter the film list">
      {languages.length > 1 ? (
        <div className={styles.filterGroup}>
          <h2 className={styles.filterLegend} id="filter-language">
            Language
          </h2>
          <ul className={styles.filterList} aria-labelledby="filter-language">
            {pill("language", null, "All", languageTotal)}
            {languages.map((option) => pill("language", option.value, option.label, option.count))}
          </ul>
        </div>
      ) : null}

      {formats.length > 1 ? (
        <div className={styles.filterGroup}>
          <h2 className={styles.filterLegend} id="filter-format">
            Format
          </h2>
          <ul className={styles.filterList} aria-labelledby="filter-format">
            {pill("format", null, "All", formatTotal)}
            {formats.map((option) => pill("format", option.value, option.label, option.count))}
          </ul>
        </div>
      ) : null}

      <div className={styles.filterFooter}>
        <p aria-live="polite">
          Showing {resultCount} of {totalCount} film{totalCount === 1 ? "" : "s"}
          {hasFilters ? " matching your filters" : ""}.
        </p>
        {hasFilters ? (
          <Link href={buildHref(basePath, {})} className={styles.filterPill}>
            Clear filters
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
