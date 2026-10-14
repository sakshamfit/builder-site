import Link from "next/link";
import { NAV_ITEMS } from "@/lib/nav";
import { siteConfig } from "@/lib/site-config";
import { CrowdCanvas } from "@/components/ui/skiper39";
import { venue } from "@/data/cinema";
import { confirmed, confirmedAddressLines, directionsLink } from "@/lib/cinema-content";
import styles from "./layout.module.css";

/**
 * Footer.
 *
 * Set on the accent colour, like the back of a poster. Carries the three things
 * a venue footer must: how to reach the place, where to get help, and who is
 * responsible for the content.
 */
export function SiteFooter() {
  const addressLines = confirmedAddressLines();
  const directions = directionsLink();
  const phone = confirmed(venue.contact.phone);
  const email = confirmed(venue.contact.email);
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.footerContent}`}>
        <span className={`eyebrow ${styles.footerEyebrow}`}>Madhuban · Bihar · India</span>

        <p className={styles.footerTitle}>
          <span>{siteConfig.brandName}</span>
        </p>

        <ul className={styles.footerLinks}>
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>

        <div className={styles.footerGrid}>
          <div>
            <h2 className={styles.footerHeading}>Visit</h2>
            <address className={styles.footerAddress}>
              {addressLines.length > 0
                ? addressLines.map((line) => <span key={line}>{line}</span>)
                : "The address is still being confirmed with the venue."}
            </address>
            {directions ? (
              <a
                className={styles.footerLink}
                href={directions.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                Get directions (opens Google Maps)
              </a>
            ) : null}
          </div>

          <div>
            <h2 className={styles.footerHeading}>Contact</h2>
            <ul className={styles.footerList}>
              <li>
                {phone ? (
                  <a className={styles.footerLink} href={`tel:${phone.replace(/\s+/g, "")}`}>
                    {phone}
                  </a>
                ) : (
                  "Phone not yet supplied by the venue."
                )}
              </li>
              <li>
                {email ? (
                  <a className={styles.footerLink} href={`mailto:${email}`}>
                    {email}
                  </a>
                ) : (
                  "Email not yet supplied by the venue."
                )}
              </li>
              <li>
                <Link className={styles.footerLink} href="/help">
                  Help and booking questions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>
            Crowd animation adapted from Skiper UI (attribution required under its free licence).
            Illustration by openpeeps.
          </p>
          <p>
            © {year} {siteConfig.brandName}. A venue website. Not affiliated with, endorsed by, or
            operated by the mall or any cinema chain unless an attribution line appears above.
          </p>
          <p>
            {siteConfig.hasScreeningSchedule
              ? "Screening times are supplied by the venue's ticketing partner. Release dates in the film programme are sourced from published release calendars and cited on each film."
              : "Film release dates are sourced from published release calendars, with the sources listed on each film. Screening times, prices and seat availability come from a cinema's own ticketing system; they appear here once the venue connects it."}
          </p>
        </div>
      </div>

      {/*
        A crowd walking the footer's floor.

        It is its own band, below all of the copy — not a background layer behind
        it. The figures are illustrations of a different venue's audience, so
        nothing in this footer is ever printed over them: no heading, no link and
        no small print crosses a single figure, and none of the copy needs a halo
        or a backing plate to stay legible. The band is decorative and hidden from
        assistive technology, its figures are not interactive, and visitors who ask
        for reduced motion do not get the band at all (see .footerCrowd in
        layout.module.css).
      */}
      <div className={`${styles.footerCrowd} footer-crowd`} aria-hidden="true">
        <CrowdCanvas
          src="https://cdn.21st.dev/assets/localized/abdb8990a7bef8c2f5af3e45f0a3c969c4b0603fba8be92e81347de4ea4e1ed7.png"
          rows={15}
          cols={7}
          height="100%"
        />
      </div>
    </footer>
  );
}
