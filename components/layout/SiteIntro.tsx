"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import MetroHero from "@/components/ui/scroll-locked-video-hero";

/**
 * The opening of the site.
 *
 * Renders the scroll-locked video intro over the whole page. The reader scrubs
 * the film with the wheel, touch or arrow keys; pushing past its last frame
 * fades it away and the site underneath is revealed. It is server-rendered (so
 * the first paint is already the intro, with no flash of the page behind it)
 * and hidden by CSS for visitors without JavaScript, so nobody is ever stuck
 * behind it.
 *
 * Readers who ask for reduced motion never see it.
 */

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function SiteIntro() {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
  const [entered, setEntered] = useState(false);
  const handleEnter = useCallback(() => setEntered(true), []);

  if (reducedMotion || entered) return null;

  return (
    <>
      <noscript>
        <style>{".site-intro{display:none!important}"}</style>
      </noscript>
      <MetroHero
        className="site-intro"
        style={{ position: "fixed", inset: 0, zIndex: 1000, height: "100dvh" }}
        title="MADHUBAN METRO"
        scrollHint="SCROLL TO ENTER"
        tagline="Every door in the city is already open."
        onEnter={handleEnter}
      />
    </>
  );
}
