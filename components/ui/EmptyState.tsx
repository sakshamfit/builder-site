import type { ReactNode } from "react";
import styles from "./ui.module.css";

/**
 * The honest state.
 *
 * Used whenever there is nothing to show — no approved offers, no screenings on
 * a date, a schedule that could not be read. It always explains why, so an
 * empty screen never looks like a broken one.
 */
export function EmptyState({
  title,
  children,
  action,
  headingLevel = 3,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  headingLevel?: 2 | 3 | 4;
}) {
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";

  return (
    <div className={styles.empty}>
      <Heading className={styles.emptyTitle}>{title}</Heading>
      {children ? <div className={styles.emptyBody}>{children}</div> : null}
      {action ? <div className={styles.emptyAction}>{action}</div> : null}
    </div>
  );
}
