import { siteConfig } from "@/lib/site-config";
import styles from "./layout.module.css";

/**
 * The wordmark.
 *
 * The trade name set in type, in two tiers: the first word large in the display
 * face, everything after it small and letterspaced in the accent beneath or
 * beside it. This is the identity the approved design uses, and it needs no
 * artwork — which is the point. No logo, monogram or stamp is drawn anywhere on
 * this site: the venue has not supplied one, and drawing one would be inventing
 * brand identity on its behalf. If a logo arrives later it belongs in
 * `public/brand/` (see the README there).
 *
 * Splitting on the first space rather than hard-coding two halves means the mark
 * survives whatever the trade name turns out to be, which matters here: the name
 * is configuration, and the mark must not have to be edited when it changes.
 */
export function BrandMark({ className }: { className?: string }) {
  const words = siteConfig.brandName.trim().split(/\s+/).filter(Boolean);
  const lead = words[0] ?? siteConfig.brandName;
  const tail = words.slice(1).join(" ");

  return (
    <span className={[styles.brandMark, className].filter(Boolean).join(" ")}>
      <span className={styles.brandLead}>{lead}</span>
      {tail ? <span className={styles.brandTail}>{tail}</span> : null}
    </span>
  );
}
