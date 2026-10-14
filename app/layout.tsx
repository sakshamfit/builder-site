import type { Metadata, Viewport } from "next";
import { Rail } from "@/components/layout/Rail";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { RevealProvider } from "@/components/layout/RevealProvider";
import { SiteIntro } from "@/components/layout/SiteIntro";
import { ModeProvider } from "@/components/layout/ModeProvider";
import { siteConfig } from "@/lib/site-config";
import { APPEARANCE_BOOTSTRAP } from "@/lib/appearance";

/*
 * Self-hosted, OFL-1.1 licensed fonts (see ASSET_CREDITS.md).
 * Anton carries the oversized condensed display voice, Barlow handles interface
 * labels and numbers, DM Sans carries body copy.
 *
 * Imported here rather than fetched from a font CDN: no third-party request, no
 * layout shift, and the licence travels with the repository.
 */
import "@fontsource/anton";
import "@fontsource/barlow/400.css";
import "@fontsource/barlow/600.css";
import "@fontsource/barlow/700.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource-variable/dm-sans";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: `${siteConfig.brandName} — showtimes, location and visiting information`,
    template: `%s · ${siteConfig.brandName}`,
  },
  description:
    "Showtimes, dates and venue information for the cinema at Madhuban, Bihar. Find what is playing, plan your visit, and continue to the venue's ticketing partner to book.",
  applicationName: siteConfig.brandName,
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f4f1e6",
  /*
   * `colorScheme` is deliberately not set here. The day and night palettes each
   * declare their own `color-scheme` in app/globals.css, keyed off the same
   * attribute the theme is applied with; a static value here would fight them.
   */
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /*
     * `suppressHydrationWarning` covers the one attribute React does not render:
     * the appearance below, which the pre-paint script has already set on this
     * element by the time hydration runs. Nothing else on <html> changes.
     */
    <html lang="en-IN" suppressHydrationWarning>
      <body>
        {/*
          Appearance, before first paint.

          A reader who left the site on the night sheet must not be shown a cream
          flash while React boots, so this runs inline, ahead of the page, and
          only ever sets one attribute. It is built from the constants in
          lib/appearance.ts rather than typed out here, and if it fails for any
          reason — storage blocked, `matchMedia` missing — nothing breaks: the
          server already rendered the day sheet, which is a complete page.
        */}
        <script dangerouslySetInnerHTML={{ __html: APPEARANCE_BOOTSTRAP }} />

        {/* Opening: the scroll-scrubbed video intro. Covers the page until entered. */}
        <SiteIntro />

        {/*
          Film grain. Fixed, decorative, pointer-events none — it sits over the
          page the way grain sits over a print, and is never interactive.
        */}
        <div className="grain" aria-hidden="true" />

        <a className="skip-link" href="#main">
          Skip to main content
        </a>

        {/*
          Day / night.

          The provider wraps the header and the page because the header carries
          the switch and reads the state from here. The pages themselves do not
          read it at all — every surface paints from the tokens in globals.css,
          which the `data-mode` attribute on <html> redefines.
        */}
        <ModeProvider>
          <Rail />
          <SiteHeader />

          <main id="main">{children}</main>

          <SiteFooter />
        </ModeProvider>

        <RevealProvider />
      </body>
    </html>
  );
}
