import Link from "next/link";
import { pendingFacts } from "@/data/cinema";
import styles from "./home.module.css";

/**
 * Prelude — one editorial beat between the opening scene and the page proper.
 *
 * Adapted from `Prelude` in the owner's `vistaRail` repository (see
 * ASSET_CREDITS.md §10), which places a single restrained statement directly
 * beneath the hero so the page has somewhere quiet to land before it starts
 * listing things.
 *
 * Two differences. It is a **server component**: upstream reveals it with
 * framer-motion, here it uses the site's existing `.reveal` reader (which is a
 * progressive enhancement, so the paragraph is in the HTML and visible without
 * JavaScript). And its content is **derived from the venue record** rather than
 * written as brand copy — the number of outstanding details and the examples
 * named are read from `pendingFacts()`, so this paragraph cannot claim something
 * the rest of the site contradicts. When the venue supplies those details, the
 * sentence shrinks by itself.
 */

/** At most this many outstanding details are named, with an ellipsis for the rest. */
const MAX_EXAMPLES = 3;

/**
 * Drops the label into the middle of a sentence, leaving initialisms alone:
 * "PIN code" is not "pIN code". The records are the venue's, not this file's, so
 * the rule has to survive whatever they are called next.
 */
function midSentence(label: string): string {
  const [firstWord = ""] = label.split(" ");
  const isInitialism = firstWord.length > 1 && firstWord === firstWord.toUpperCase();
  return isInitialism ? label : label.charAt(0).toLowerCase() + label.slice(1);
}

export function Prelude() {
  const outstanding = pendingFacts();
  const examples = outstanding.slice(0, MAX_EXAMPLES).map((fact) => midSentence(fact.label)).join(", ");
  const count =
    outstanding.length === 1 ? "One detail is" : `${outstanding.length} details are`;
  const more = outstanding.length > MAX_EXAMPLES ? ", among others" : "";

  /* Assembled as one string rather than three JSX fragments: the sentence carries
     em dashes, and JSX would decide the spacing around them, not this file. */
  const paragraph =
    "Everything on this site is either confirmed by the venue or cited to a published source. " +
    `${count} still with the owner — ${examples}${more} — and they are marked as outstanding ` +
    "rather than filled in with a plausible guess.";

  return (
    <section className={styles.prelude} aria-labelledby="prelude-title">
      <div className={`wrap ${styles.preludeInner} reveal`}>
        <div className={styles.preludeHead}>
          <span className="eyebrow">Before the programme</span>
          <h2 className={styles.preludeHeading} id="prelude-title">
            A hall described exactly as it is.
          </h2>
        </div>

        <div className={styles.preludeBody}>
          <p>{paragraph}</p>
          <Link className={styles.preludeLink} href="/cinema">
            The hall, and what is still outstanding <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
