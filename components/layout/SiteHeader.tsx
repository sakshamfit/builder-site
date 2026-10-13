"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FullScreenMenu } from "@/components/layout/FullScreenMenu";
import { NAV_ITEMS } from "@/lib/nav";
import { siteConfig } from "@/lib/site-config";
import styles from "./layout.module.css";

/**
 * Header.
 *
 * Sits to the right of the rail and floats over the page until the reader
 * scrolls, at which point it gains a paper backdrop so content passing beneath
 * stays legible. The primary action is "Showtimes", not "Book tickets": this
 * site has no booking flow and the label must not imply one.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={[styles.header, scrolled ? styles.headerScrolled : ""].join(" ")}>
      <Link href="/" className={styles.brand}>
        <span className={styles.brandText}>{siteConfig.brandName}</span>
        <span className={styles.brandDot} aria-hidden="true" />
        <span className={styles.brandPlace}>Chandigarh</span>
      </Link>

      <nav className={styles.nav} aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className={styles.navLink}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className={styles.headerActions}>
        <Link href="/#showtimes" className={`${styles.navLink} ${styles.headerCta}`}>
          Showtimes
        </Link>
        <FullScreenMenu items={NAV_ITEMS} brandName={siteConfig.brandName} />
      </div>
    </header>
  );
}
