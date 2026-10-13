import type { ReactNode } from "react";
import styles from "./ui.module.css";

type Tone = "neutral" | "amber" | "accent" | "ok" | "plain";

const toneClass: Record<Tone, string | undefined> = {
  neutral: undefined,
  amber: styles.badgeAmber,
  accent: styles.badgeAccent,
  ok: styles.badgeOk,
  plain: styles.badgePlain,
};

/**
 * Small status label. Never used to carry information that is not also
 * available as text elsewhere — a badge is a shorthand, not the only signal.
 */
export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span className={[styles.badge, toneClass[tone], className].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}
