import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { siteConfig } from "@/lib/site-config";
import type { ShowtimeView } from "@/lib/showtime-view";
import styles from "./showtimes.module.css";

/**
 * One screening.
 *
 * Becomes a link only when lib/ticketing-provider.ts has produced a usable
 * handoff. Otherwise it renders as a non-interactive chip: a greyed-out button
 * that does nothing is worse than plain text, and a "book" button that cannot
 * book would be a false promise.
 */
export function ShowtimeButton({ view }: { view: ShowtimeView }) {
  const { booking } = view;

  const accessibleLabel = [
    view.timeLabel,
    view.format,
    view.languageLabel,
    view.screenName,
    view.availabilityLabel ?? "availability confirmed at checkout",
    booking.kind === "ready" ? booking.label : null,
  ]
    .filter(Boolean)
    .join(", ");

  if (booking.kind === "ready") {
    const sameOrigin = booking.href.startsWith(siteConfig.siteUrl);
    const className = styles.chip;

    const content = (
      <>
        <span className="tabular">{view.timeLabel}</span>
        {/*
          Price appears only when the ticketing provider supplied one for this
          exact screening. There is no fallback, a default or a "from" figure.
        */}
        {view.priceLabel ? <span className={styles.chipPrice}>{view.priceLabel}</span> : null}
        {view.availabilityLabel ? (
          <Badge tone={view.availabilityTone}>{view.availabilityLabel}</Badge>
        ) : null}
      </>
    );

    if (sameOrigin) {
      return (
        <Link href={booking.href} className={className} aria-label={accessibleLabel}>
          {content}
        </Link>
      );
    }

    return (
      <a
        href={booking.href}
        className={className}
        aria-label={`${accessibleLabel}. Opens the ticketing partner in a new tab.`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return (
    <span
      className={[styles.chip, styles.chipStatic, view.hasStarted ? styles.chipStarted : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="tabular">{view.timeLabel}</span>
      {view.hasStarted ? (
        <span className={styles.chipFlag}>started</span>
      ) : view.availabilityLabel ? (
        <Badge tone={view.availabilityTone}>{view.availabilityLabel}</Badge>
      ) : null}
    </span>
  );
}
