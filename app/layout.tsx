import type { Metadata, Viewport } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { UtilityStrip } from "@/components/layout/UtilityStrip";
import { RevealProvider } from "@/components/layout/RevealProvider";
import { ModeProvider } from "@/components/layout/ModeProvider";
import { SiteIntro } from "@/components/cinematic/SiteIntro";
import { siteConfig } from "@/lib/site-config";
import { APPEARANCE_BOOTSTRAP } from "@/lib/appearance";
import { CINEMATIC_BOOTSTRAP } from "@/lib/cinematic";
import { placeLabel } from "@/lib/cinema-content";

/*
 * Self-hosted, OFL-1.1 licensed fonts (see ASSET_CREDITS.md).
 * Archivo carries the headings, Inter the body copy, JetBrains Mono everything
 * that is read off the screen rather than read through: screening times, prices,
 * codes and the micro-labels above each block.
 *
 * Imported here rather than fetched from a font CDN: no third-party request, no
 * layout shift, and the licence travels with the repository.
 */
import "@fontsource-variable/archivo";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";

import "./globals.css";

const place = placeLabel();

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: `${siteConfig.brandName} — showtimes, location and visiting information`,
    template: `%s · ${siteConfig.brandName}`,
  },
  description: `Showtimes, dates and venue information for the cinema${place ? ` at ${place}` : ""}. Find what is playing, plan your visit, and continue to the venue's ticketing partner to book.`,
  applicationName: siteConfig.brandName,
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f6f3ee",
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
     *
     * `data-scroll-behavior` tells Next that the stylesheet's smooth scrolling is
     * for in-page anchors only, so a route change jumps to the top of the new page
     * instead of gliding the length of a long one.
     */
    <html lang="en-IN" data-scroll-behavior="smooth" suppressHydrationWarning>
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

        {/*
          Motion, before first paint — the same contract as the script above.
          It restores a reader's "pause films" choice, and on the first home-page
          load of a visit (never under reduced motion, never without JavaScript)
          starts the opening intro below, which is CSS from then on and removes
          itself. Built from the constants in lib/cinematic.ts.
        */}
        <script dangerouslySetInnerHTML={{ __html: CINEMATIC_BOOTSTRAP }} />
        <SiteIntro />

        {/*
          Projector dust. Fixed, decorative, pointer-events none — the finest
          grain over the whole surface, never a texture a reader has to read
          through.
        */}
        <div className="grain" aria-hidden="true" />

        <a className="skip-link" href="#main">
          Skip to main content
        </a>

        {/*
          Day / night.

          The provider wraps the chrome because the utility strip carries the
          switch and reads the state from here. The pages themselves do not read
          it at all — every surface paints from the tokens in globals.css, which
          the `data-mode` attribute on <html> redefines.
        */}
        <ModeProvider>
          <UtilityStrip />
          <SiteHeader />

          <main id="main">{children}</main>

          <SiteFooter />
        </ModeProvider>

        <RevealProvider />
      </body>
    </html>
  );
}
