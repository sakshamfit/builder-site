import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { venue } from "@/data/cinema";
import { SCREEN_NAMING_NOTE, confirmed } from "@/lib/cinema-content";
import cinemaStyles from "@/components/cinema/cinema.module.css";

/**
 * What the venue is actually like.
 *
 * Deliberately unglamorous: screens and the formats assigned to them come from
 * the venue record, and everything still awaiting sign-off is labelled as such.
 * No superlatives, no certifications, no claimed equipment specs — those would
 * be claims the venue has not made.
 */
export function CinemaExperience() {
  const accessibilityPending = venue.accessibility.filter((item) => item.status !== "confirmed");
  const region = confirmed(venue.address.region);

  return (
    <section className="scene-pad" aria-labelledby="experience-title">
      <div className="wrap reveal">
        <div className="section-head">
          <div>
            <span className="eyebrow">Inside the venue</span>
            <h2 id="experience-title">The cinema experience</h2>
            <p>
              What we can state as fact about this venue, and what is still being confirmed with the
              cinema{region ? ` in ${region}` : ""}.
            </p>
          </div>
          <Button href="/cinema" variant="outline" size="small">
            Full venue details
          </Button>
        </div>

        <div className={cinemaStyles.layout}>
          <section className={`box ${cinemaStyles.panel}`} aria-labelledby="exp-screens">
            <h3 className={cinemaStyles.panelTitle} id="exp-screens">
              Screens and formats
            </h3>
            <p className={cinemaStyles.pendingNote}>{SCREEN_NAMING_NOTE}</p>
            <ul className={cinemaStyles.screenList}>
              {venue.screens.map((screen) => (
                <li className={cinemaStyles.screenItem} key={screen.id}>
                  <span className={cinemaStyles.screenName}>{screen.name}</span>
                  <span className={cinemaStyles.screenFormats}>
                    {screen.formats.map((format) => (
                      <Badge key={format} tone="plain">
                        {format}
                      </Badge>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className={`box ${cinemaStyles.panel}`} aria-labelledby="exp-access">
            <h3 className={cinemaStyles.panelTitle} id="exp-access">
              Access and facilities
            </h3>
            <p className={cinemaStyles.pendingNote}>
              These are listed individually because the venue has not confirmed them all at once.
              Until an item is confirmed, please treat it as unavailable and ask at the cinema.
            </p>
            <dl className={cinemaStyles.definitionList}>
              {accessibilityPending.slice(0, 4).map((item) => (
                <div className={cinemaStyles.definition} key={item.id}>
                  <dt className={cinemaStyles.definitionTerm}>
                    {item.label} <Badge tone="amber">Being confirmed</Badge>
                  </dt>
                  <dd className={cinemaStyles.pendingValue}>
                    {item.detail ?? "Still being confirmed with the venue."}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
    </section>
  );
}
