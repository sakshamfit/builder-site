import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { PrimaryNav, type NavItem } from "@/components/layout/PrimaryNav";
import { siteConfig } from "@/lib/site-config";
import { venue } from "@/data/cinema";
import { confirmed } from "@/lib/cinema-content";
import styles from "./layout.module.css";

export const NAV_ITEMS: NavItem[] = [
  { label: "Movies", href: "/movies", hint: "What's on" },
  { label: "Showtimes", href: "/#showtimes", hint: "Today onwards" },
  { label: "Cinema", href: "/cinema", hint: "Getting here" },
  { label: "Offers", href: "/offers", hint: "Approved promotions" },
  { label: "Help", href: "/help", hint: "Booking and policies" },
];

/**
 * The venue wordmark.
 *
 * Drawn here rather than shipping a logo file: the official mark is an owner
 * decision, and inventing one would misrepresent the brand. This is a neutral
 * screen-light glyph that any confirmed logo can replace.
 */
function BrandMark() {
  return (
    <svg
      className={styles.brandMark}
      viewBox="0 0 32 32"
      role="img"
      aria-label={`${siteConfig.brandName} mark`}
      focusable="false"
    >
      <rect x="2.5" y="7.5" width="27" height="18" rx="3" fill="#0e1116" />
      <rect
        x="2.5"
        y="7.5"
        width="27"
        height="18"
        rx="3"
        fill="none"
        stroke="rgba(255,255,255,0.22)"
      />
      {/* Warm screen light spilling toward the viewer. */}
      <path d="M6 12h20l-4.5 9h-11z" fill="url(#screenLight)" />
      <rect x="6" y="22.6" width="20" height="1.6" rx="0.8" fill="#e2554e" />
      <defs>
        <linearGradient id="screenLight" x1="16" y1="12" x2="16" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f0c486" stopOpacity="0.9" />
          <stop offset="1" stopColor="#f0c486" stopOpacity="0.08" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Site header.
 *
 * Sticky, with the location context and a high-contrast ticket action always
 * present. The ticket button points at the showtime chooser — no separate
 * booking flow exists on this site, so the label never promises one.
 */
export function SiteHeader() {
  const place = confirmed(venue.address.region) ?? "Chandigarh";

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerInner}`}>
        <Link href="/" className={styles.brand}>
          <BrandMark />
          <span className={styles.brandText}>
            <span className={styles.brandName}>{siteConfig.brandName}</span>
            <span className={styles.brandPlace}>{place}</span>
          </span>
        </Link>

        <PrimaryNav items={NAV_ITEMS} variant="header" />

        <div className={styles.headerActions}>
          {/*
            The persistent action is "Showtimes", not "Book tickets": this site
            has no booking flow, and the label must not imply one. It stays
            high-contrast so showtime discovery is still one tap away.
          */}
          <Button
            href="/#showtimes"
            variant="primary"
            size="small"
            className={styles.headerCta}
            ariaLabel="Showtimes — choose a screening"
          >
            Showtimes
          </Button>

          <MobileNavigation
            items={NAV_ITEMS}
            brandName={siteConfig.brandName}
            place={place}
            ctaHref="/#showtimes"
            ctaLabel="Showtimes"
            meta={[
              "A showcase of the cinema hall. Ticket links appear once the venue's ticketing partner is confirmed.",
            ]}
          />
        </div>
      </div>
    </header>
  );
}
