import { Badge } from "@/components/ui/Badge";
import { venue } from "@/data/cinema";
import { SCREEN_NAMING_NOTE, confirmed } from "@/lib/cinema-content";
import type { Facility } from "@/lib/types";
import styles from "./cinema.module.css";

/**
 * Facilities and accessibility.
 *
 * Every entry carries its own verification state. A confirmed facility is
 * stated plainly; an unconfirmed one shows what is still being checked. This is
 * the only honest way to publish accessibility information before the venue has
 * signed it off — an unverified claim about step-free access is exactly the
 * kind of thing that strands someone at the door.
 */
function FacilityList({ items, emptyLabel }: { items: Facility[]; emptyLabel: string }) {
  if (items.length === 0) {
    return <p className={styles.pendingValue}>{emptyLabel}</p>;
  }

  return (
    <dl className={styles.definitionList}>
      {items.map((item) => (
        <div className={styles.definition} key={item.id}>
          <dt className={styles.definitionTerm}>
            {item.label}
            {item.status === "pending" ? (
              <>
                {" "}
                <Badge tone="amber">Being confirmed</Badge>
              </>
            ) : (
              <>
                {" "}
                <Badge tone="ok">Confirmed</Badge>
              </>
            )}
          </dt>
          <dd
            className={item.status === "pending" ? styles.pendingValue : styles.definitionValue}
          >
            {item.status === "pending"
              ? (item.detail ?? "This detail is still being confirmed with the venue.")
              : (item.detail ?? "Confirmed by the venue.")}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function Facilities() {
  return (
    <>
      <section className={`surface ${styles.panel}`} aria-labelledby="facilities-title">
        <h2 className={styles.panelTitle} id="facilities-title">
          At the cinema
        </h2>
        <FacilityList items={venue.facilities} emptyLabel="No facility information has been supplied." />
      </section>

      <section className={`surface ${styles.panel}`} aria-labelledby="access-title">
        <h2 className={styles.panelTitle} id="access-title">
          Accessibility
        </h2>
        <p className={styles.pendingValue}>
          Accessibility details are listed individually because they are not all confirmed at once.
          Until an item is confirmed, please treat it as unavailable and check with the cinema.
        </p>
        <FacilityList
          items={venue.accessibility}
          emptyLabel="No accessibility information has been supplied."
        />
      </section>
    </>
  );
}

/**
 * Screen list. Screen names are working labels until the venue confirms how it
 * names its auditoriums, and this component says so rather than presenting
 * "Screen 1" as though it were the venue's own naming.
 */
export function ScreenLegend() {
  return (
    <section className={`surface ${styles.panel}`} aria-labelledby="screens-title">
      <h2 className={styles.panelTitle} id="screens-title">
        Screens
      </h2>
      <p className={styles.pendingValue}>{SCREEN_NAMING_NOTE}</p>

      <ul className={styles.screenList}>
        {venue.screens.map((screen) => (
          <li className={styles.screenItem} key={screen.id}>
            <span className={styles.screenName}>{screen.name}</span>
            <span className={styles.screenFormats}>
              {screen.formats.map((format) => (
                <Badge key={format} tone="plain">
                  {format}
                </Badge>
              ))}
            </span>
          </li>
        ))}
      </ul>

      <p className={styles.pendingNote}>
        {confirmed(venue.address.region)
          ? "Formats listed per screen come from the venue's own schedule assignment."
          : "Format assignments will be listed once the venue confirms them."}
      </p>
    </section>
  );
}
