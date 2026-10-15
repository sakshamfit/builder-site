import Link from "next/link";
import { BrandMark } from "@/components/layout/BrandMark";
import { MailIcon } from "@/components/ui/icons";
import { FOOTER_SECTIONS } from "@/lib/nav";
import { siteConfig } from "@/lib/site-config";
import { venue } from "@/data/cinema";
import { confirmed, confirmedAddressLines, placeLabel, venueLocationSentence } from "@/lib/cinema-content";
import styles from "./layout.module.css";

/**
 * Footer.
 *
 * Four columns on the night ground, closed by a legal bar: who this is, the
 * three ways a visitor actually navigates (what is on, how to get in, who to
 * ask), the standing small print, and the sources every fact on the site came
 * from.
 *
 * Three rules hold here:
 *
 *   1. **No unapproved marketing.** The line under the wordmark is the venue's
 *      own approved description when one has been supplied, and a factual
 *      sentence built from the venue record when one has not.
 *   2. **No dead controls.** The newsletter block is rendered only when a
 *      destination for the signup has been configured; otherwise the column
 *      carries the concierge route instead of an input that collects nothing.
 *   3. **The small print stays true.** The attribution and the sourcing line are
 *      generated from the same configuration and the same records the rest of
 *      the site reads, so they cannot drift into a claim the site does not
 *      support.
 */
export function SiteFooter() {
  const addressLines = confirmedAddressLines();
  const place = placeLabel();
  const location = venueLocationSentence();
  const phone = confirmed(venue.contact.phone);
  const email = confirmed(venue.contact.email);
  const year = new Date().getFullYear();

  const description =
    siteConfig.brandDescription ||
    [
      `A cinema ${location ?? "venue"} with its own ticketing partner.`,
      "Screening times, prices and seat availability are published here only once the venue's feed supplies them.",
    ].join(" ");

  return (
    <footer className={styles.footer}>
      <div className="wrap">
        <div className={styles.footerColumns}>
          <div className={styles.footerBrand}>
            <BrandMark className={styles.footerMark} />
            {place ? <span className={styles.footerPlace}>{place}</span> : null}
            <p className={styles.footerDescription}>{description}</p>

            {siteConfig.newsletterEndpoint ? (
              <form
                className={styles.newsletter}
                action={siteConfig.newsletterEndpoint}
                method="post"
                aria-labelledby="newsletter-title"
              >
                <span className={styles.footerHeading} id="newsletter-title">
                  Cinematic newsletter
                </span>
                <div className={styles.newsletterRow}>
                  <label className={styles.visuallyHiddenLabel} htmlFor="newsletter-email">
                    Email address
                  </label>
                  <input
                    className={styles.newsletterInput}
                    id="newsletter-email"
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    placeholder="Enter your email"
                  />
                  <button className={styles.newsletterButton} type="submit">
                    Join
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.newsletter}>
                <span className={styles.footerHeading}>Concierge</span>
                <p className={styles.newsletterNote}>
                  Newsletter signup opens once the venue connects a mailing list.
                </p>
                <Link className={styles.footerLink} href="/help#contact-title">
                  <MailIcon className={styles.footerLinkIcon} />
                  Ask the venue a question
                </Link>
              </div>
            )}
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <nav key={section.heading} className={styles.footerSection} aria-label={section.heading}>
              <span className={styles.footerHeading}>{section.heading}</span>
              <ul className={styles.footerList}>
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link className={styles.footerLink} href={item.href}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className={styles.footerLegal}>
          <div className={styles.footerLegalText}>
            <p>
              © {year} {siteConfig.brandName}
              {addressLines.length > 0 ? ` · ${addressLines.join(", ")}` : ""}
              {phone ? ` · ${phone}` : ""}
              {email ? ` · ${email}` : ""}
            </p>
            {siteConfig.attribution ? <p>{siteConfig.attribution}</p> : null}
            <p>
              An independent venue website. Not affiliated with, endorsed by or operated by any
              other cinema chain or by the mall, unless an attribution line appears here.
            </p>
            <p>
              {siteConfig.hasScreeningSchedule
                ? "Screening times and prices are supplied by the venue's ticketing partner. Film release dates are sourced from published release calendars and cited on each film."
                : "Film release dates are sourced from published release calendars, with the sources listed on each film. Screening times, prices and seat availability come from a cinema's own ticketing system; they appear here once the venue connects it."}
            </p>
          </div>

          <ul className={styles.footerLegalLinks}>
            <li>
              <Link href="/policies#privacy">Privacy policy</Link>
            </li>
            <li>
              <Link href="/policies#terms">Terms of service</Link>
            </li>
            <li>
              <Link href="/policies#safety">Safety guidelines</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
