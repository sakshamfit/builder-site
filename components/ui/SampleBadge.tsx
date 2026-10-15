import type { ReactNode } from "react";
import { SAMPLE_LABEL, SAMPLE_NOTICE } from "@/lib/sample-content";
import styles from "./ui.module.css";

/**
 * The sample marker.
 *
 * Anything rendered from `lib/sample-content.ts` carries this, and that is the
 * whole reason the sample layer is allowed to exist: a rehearsal timetable is
 * useful, a rehearsal timetable that reads like the venue's own is a lie a
 * visitor could act on. The marker is a visible chip on the block it belongs to,
 * not a tooltip and not a comment in the markup.
 *
 * It is deliberately *not* an amber "awaiting confirmation" badge: those say a
 * fact is coming from the venue, this says the value in front of you is a
 * design sample and where the real one comes from.
 */
export function SampleBadge({ className }: { className?: string }) {
  return (
    <span className={[styles.sampleMark, className].filter(Boolean).join(" ")}>
      <span className={styles.sampleDot} aria-hidden="true" />
      {SAMPLE_LABEL}
    </span>
  );
}

/**
 * The sample notice.
 *
 * One sentence saying what the values are, what they are for, and what replaces
 * them. Rendered once per screen (never per value), immediately before the block
 * it describes, so a reader who scrolls past the marker still meets it.
 */
export function SampleNotice({ children }: { children?: ReactNode }) {
  return (
    <p className={styles.sampleNotice}>
      <strong>{SAMPLE_LABEL} content.</strong> {children ?? SAMPLE_NOTICE}
    </p>
  );
}
