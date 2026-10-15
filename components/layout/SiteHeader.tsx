"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/layout/BrandMark";
import { FullScreenMenu } from "@/components/layout/FullScreenMenu";
import { PersonIcon, SearchIcon } from "@/components/ui/icons";
import { NAV_ITEMS } from "@/lib/nav";
import { siteConfig } from "@/lib/site-config";
import styles from "./layout.module.css";

/**
 * Header.
 *
 * The main bar of the two-tier header: wordmark on the left, the six sections
 * across the middle, and the ticket action on the right, with a search shortcut
 * that goes to the programme (this site has one place to look for a film — the
 * programme — so the control points there rather than opening a second search
 * box that would search nothing).
 *
 * It floats over the top of the page and gains a backdrop once the reader
 * scrolls, so content passing beneath it stays legible.
 *
 * The ticket action's label is not decoration: it says "Book tickets" only when
 * a ticketing provider has actually been confirmed, and "Showtimes" otherwise.
 * A button that promises a checkout this venue cannot yet offer is the one kind
 * of lie a header should never tell.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const bookingReady = Boolean(siteConfig.ticketing.providerName);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={[styles.header, "site-header", scrolled ? styles.headerScrolled : ""].join(" ")}>
      <div className={`wrap ${styles.headerInner}`}>
        <Link href="/" className={styles.brand} aria-label={`${siteConfig.brandName} — home`}>
          <BrandMark />
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.headerActions}>
          <Link href="/movies" className={styles.iconButton} aria-label="Find a film in the programme">
            <SearchIcon className={styles.iconGlyph} />
          </Link>

          <Link href="/showtimes" className={styles.cta}>
            {bookingReady ? "Book tickets" : "Showtimes"}
          </Link>

          <Link href="/help" className={styles.iconButton} aria-label="Concierge and help">
            <PersonIcon className={styles.iconGlyph} />
          </Link>

          <FullScreenMenu
            items={NAV_ITEMS}
            brandName={siteConfig.brandName}
            note={
              siteConfig.ticketing.providerName
                ? `Ticket sales are completed by ${siteConfig.ticketing.providerName}. This site shows what is playing and hands you over to them.`
                : "This site shows what is playing and where the cinema is. Ticket links appear once the venue's ticketing partner is confirmed."
            }
          />
        </div>
      </div>
    </header>
  );
}
