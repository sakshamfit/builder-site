"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/site-config";
import styles from "./layout.module.css";

/**
 * The left navigation rail.
 *
 * The structural signature of the site: a fixed vertical channel down the left
 * edge holding the brand mark, a scroll-progress rule, a vertical section label
 * and the current section number. Everything else in the layout is offset by
 * its width, which is what gives the pages their poster margin.
 *
 * On narrow screens it narrows rather than disappearing, so the progress and
 * the mark stay with the reader.
 *
 * Scroll progress is decorative — it restates position the browser already
 * conveys — so it is hidden from assistive technology and is unnecessary for
 * the page to work.
 */
export function Rail() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    function update() {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0);
    }

    function onScroll() {
      // Coalesce to one update per frame; scroll fires far more often than that.
      if (frame === 0) frame = window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const percentage = Math.round(progress * 100);

  return (
    <div className={styles.rail}>
      <span className={styles.railMark} aria-hidden="true">
        {/* Neutral working mark: the official logo replaces it once approved. */}
        {siteConfig.brandName.charAt(0)}
        <span>.</span>
      </span>

      <div className={styles.railProgress} aria-hidden="true">
        <span style={{ transform: `scaleY(${progress})` }} />
      </div>

      <span className={styles.railLabel} aria-hidden="true">
        Cinema · Chandigarh
      </span>

      <span className={styles.railNumber} aria-hidden="true">
        {String(percentage).padStart(3, "0")}
      </span>
    </div>
  );
}
