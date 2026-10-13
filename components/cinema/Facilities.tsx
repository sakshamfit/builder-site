import { Badge } from "@/components/ui/Badge";
import { venue } from "@/data/cinema";
import { getVenueWithScreens } from "@/lib/schedule-source";
import { confirmed } from "@/lib/cinema-content";
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
      <section className={`box ${styles.panel}`} aria-labelledby="facilities-title">
        <h2 className={styles.panelTitle} id="facilities-title">
          At the cinema
        </h2>
        <FacilityList items={venue.facilities} emptyLabel="No facility information has been supplied." />
      </section>

      <section className={`box ${styles.panel}`} aria-labelledby="access-title">
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
 * Screen list.
 *
 * The auditoriums named here are the ones the *active* programme assigns
 * screenings to. In live mode that is the partner payload, so visitors see the
 * cinema's real auditorium names; in development it is the working labels, and
 * the component says so rather than presenting "Screen 1" as the venue's naming.
 *
 * When the programme feed is unreachable, the list is empty and says why — it
 * never falls back to sample auditoriums, which would show a visitor a layout
 * the venue may not have.
 */
export async function ScreenLegend() {
  const { venue: resolved, screensFrom } = await getVenueWithScreens();
  const screens = resolved.screens;

  if (screens.length === 0) {
    return (
      <section className={`box ${styles.panel}`} aria-labelledby="screens-title">
        <h2 className={styles.panelTitle} id="screens-title">
          Screens
        </h2>
        <p className={styles.pendingValue}>
          {screensFrom !== "feed"
            ? "The cinema has not supplied its auditorium list. Screen names, formats and accessibility provision appear here only once the venue's own scheduling data carries them."
            : "No auditorium details have been supplied."}
        </p>
      </section>
    );
  }

  return (
    <section className={`box ${styles.panel}`} aria-labelledby="screens-title">
      <h2 className={styles.panelTitle} id="screens-title">
        Screens
      </h2>
      <ul className={styles.screenList}>
        {screens.map((screen) => (
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
