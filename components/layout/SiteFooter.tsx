import Link from "next/link";
import { NAV_ITEMS } from "@/components/layout/SiteHeader";
import { siteConfig } from "@/lib/site-config";
import { venue } from "@/data/cinema";
import { confirmed, confirmedAddressLines, directionsLink } from "@/lib/cinema-content";
import styles from "./layout.module.css";

/**
 * Site footer.
 *
 * Carries the three things a venue site's footer must carry: how to reach the
 * place, where to get help, and who is responsible for the content. Policy
 * pages are listed only as far as they actually exist — see the note about
 * approved copy.
 */
export function SiteFooter() {
  const addressLines = confirmedAddressLines();
  const directions = directionsLink();
  const phone = confirmed(venue.contact.phone);
  const email = confirmed(venue.contact.email);
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerGrid}`}>
        <div>
          <p className={styles.footerBrandName}>{siteConfig.brandName}</p>
          <p className={styles.footerBlurb}>
            A venue website for the cinema at Elante Mall, Chandigarh. Find what is playing, choose
            a date, and continue to the venue&apos;s ticketing partner to complete a booking.
          </p>
        </div>

        <div className={styles.footerCol}>
          <h2 className={styles.footerTitle}>Visit</h2>
          <address className={styles.footerList} style={{ fontStyle: "normal" }}>
            {addressLines.length > 0 ? (
              addressLines.map((line) => <span key={line}>{line}</span>)
            ) : (
              <span>The address is still being confirmed with the venue.</span>
            )}
          </address>
          <ul className={styles.footerList}>
            {directions ? (
              <li>
                <a
                  className={styles.footerLink}
                  href={directions.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {directions.label} (opens Google Maps)
                </a>
              </li>
            ) : null}
            <li>
              <Link className={styles.footerLink} href="/cinema">
                Cinema details and access
              </Link>
            </li>
          </ul>
        </div>

        <div className={styles.footerCol}>
          <h2 className={styles.footerTitle}>Explore</h2>
          <ul className={styles.footerList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link className={styles.footerLink} href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.footerCol}>
          <h2 className={styles.footerTitle}>Contact</h2>
          <ul className={styles.footerList}>
            {phone ? (
              <li>
                <a className={styles.footerLink} href={`tel:${phone.replace(/\s+/g, "")}`}>
                  {phone}
                </a>
              </li>
            ) : (
              <li>Phone number not yet supplied by the venue.</li>
            )}
            {email ? (
              <li>
                <a className={styles.footerLink} href={`mailto:${email}`}>
                  {email}
                </a>
              </li>
            ) : (
              <li>Email address not yet supplied by the venue.</li>
            )}
            <li>
              <Link className={styles.footerLink} href="/help">
                Help and booking questions
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className={`container ${styles.footerBottom}`}>
        <p>
          © {year} {siteConfig.brandName}. A venue website. It is not affiliated with, endorsed by,
          or operated by the mall or any cinema chain unless an attribution line appears above.
        </p>
        <p>
          {siteConfig.isFixtureMode
            ? "Sample data in use: films, screenings and venue details shown here are development fixtures, not a real programme."
            : "Schedule data is supplied by the venue's ticketing partner."}
        </p>
      </div>
    </footer>
  );
}
