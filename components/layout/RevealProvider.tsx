"use client";

import { useEffect } from "react";

/**
 * Reveal-on-scroll, as a progressive enhancement.
 *
 * Two-phase on purpose:
 *   1. This component sets `data-reveal="ready"` on <html>, which is what makes
 *      the hidden state apply at all. If this never runs — JavaScript disabled,
 *      script failed, crawler — nothing is hidden and the page renders fully.
 *   2. Elements carrying `.reveal` are observed and given `.is-visible` when
 *      they enter the viewport.
 *
 * Anything already on screen at load is revealed immediately, so the effect
 * never delays the hero or content visible above the fold. Users who ask for
 * reduced motion are skipped entirely; the CSS in app/globals.css also forces
 * everything visible for them.
 */
export function RevealProvider() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const root = document.documentElement;
    root.setAttribute("data-reveal", "ready");

    const targets = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
    );

    for (const target of targets) observer.observe(target);

    return () => {
      observer.disconnect();
      root.removeAttribute("data-reveal");
    };
  }, []);

  return null;
}
