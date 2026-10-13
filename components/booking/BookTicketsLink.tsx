import { Button } from "@/components/ui/Button";
import type { BookingHandoff } from "@/lib/ticketing-provider";
import styles from "./booking.module.css";

/**
 * The ticket action.
 *
 * Two outcomes, both truthful:
 *
 *   ready       — a real link to the confirmed provider, labelled with the
 *                 destination so the button says where it goes, plus one line
 *                 explaining that payment happens there.
 *   unavailable — a short statement of what cannot be done and why. Never a
 *                 disabled button and never a fake checkout.
 */
export function BookTicketsLink({
  handoff,
  size = "medium",
  block = false,
}: {
  handoff: BookingHandoff;
  size?: "small" | "medium" | "large";
  block?: boolean;
}) {
  if (handoff.kind === "unavailable") {
    return (
      <div className={styles.unavailableBlock}>
        <p className={styles.unavailableTitle}>{handoff.title}</p>
        <p className={styles.unavailableDetail}>{handoff.detail}</p>
      </div>
    );
  }

  return (
    <div className={styles.handoff}>
      <Button
        href={handoff.href}
        external
        variant="red"
        size={size}
        block={block}
        ariaLabel={`${handoff.label} (opens in a new tab)`}
      >
        {handoff.label}
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
          <path
            d="M5 2h7v7M12 2L5.5 8.5M9 12H2V5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Button>
      <p className={styles.handoffNote}>{handoff.note}</p>
    </div>
  );
}
