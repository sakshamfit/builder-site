"use client";

import { useEffect, useState } from "react";
import { placeLabel } from "@/lib/cinema-content";
import styles from "./layout.module.css";

/**
 * The left navigation rail.
 *
 * The structural signature of the site: a fixed vertical channel down the left
 * edge carrying a hairline scroll-progress rule, a vertical venue label and the
 * percentage of the page read. Everything else in the layout is offset by its
 * width, which is what gives the pages their poster margin.
 *
 * **No mark is drawn here.** The site displays no logo, monogram or stamp: the
 * only identity it carries is the venue's name, set in type. That is deliberate
 * — the venue has not supplied a logo, and drawing one would be inventing brand
 * identity the cinema has not approved. If a logo is supplied later it belongs in
 * `public/brand/` (see the README there).
 *
 * Scroll progress is decorative — it restates position the browser already
 * conveys — so it is hidden from assistive technology and the page works
 * completely without it.
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
      <div className={styles.railProgress} aria-hidden="true">
        <span style={{ transform: `scaleY(${progress})` }} />
      </div>

      <span className={styles.railLabel} aria-hidden="true">
        Cinema · {placeLabel()}
      </span>

      <span className={styles.railNumber} aria-hidden="true">
        {String(percentage).padStart(3, "0")}
      </span>
    </div>
  );
}
