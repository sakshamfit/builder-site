import { ModeToggle } from "@/components/layout/ModeToggle";
import { PinIcon } from "@/components/ui/icons";
import { placeLabel } from "@/lib/cinema-content";
import { siteConfig } from "@/lib/site-config";
import styles from "./layout.module.css";

/**
 * The utility strip.
 *
 * The thin band above the header. It carries the two things that are true of the
 * whole building rather than of the page you are on: the standing announcement,
 * and where this cinema is. The appearance switch lives here too, at the far
 * right, because it is a property of the site rather than of any page.
 *
 * The announcement comes from configuration, and when it is not configured the
 * strip shows the place label instead of an unapproved promotion. A price
 * promise set in type is a commercial claim; it appears here only when the owner
 * has put the approved wording in the environment.
 */
export function UtilityStrip() {
  const { announcementTag, announcementText } = siteConfig;
  const place = placeLabel();
  const hasAnnouncement = Boolean(announcementTag || announcementText);

  return (
    <div className={`${styles.utilityStrip} utility-strip`}>
      <div className={`wrap ${styles.utilityInner}`}>
        {hasAnnouncement ? (
          <p className={styles.utilityNotice}>
            {announcementTag ? <span className={styles.utilityTag}>{announcementTag}</span> : null}
            {announcementText ? <span className={styles.utilityText}>{announcementText}</span> : null}
          </p>
        ) : (
          <p className={styles.utilityNotice}>
            <span className={styles.utilityText}>{place}</span>
          </p>
        )}

        <div className={styles.utilityRight}>
          {hasAnnouncement && place ? (
            <span className={styles.utilityPlace}>
              <PinIcon className={styles.utilityIcon} />
              {place}
            </span>
          ) : null}
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
