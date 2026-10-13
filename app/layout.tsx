import type { Metadata, Viewport } from "next";
import { Rail } from "@/components/layout/Rail";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { RevealProvider } from "@/components/layout/RevealProvider";
import { siteConfig } from "@/lib/site-config";

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
    "Showtimes, dates and venue information for the cinema at Elante Mall, Chandigarh. Find what is playing, plan your visit, and continue to the venue's ticketing partner to book.",
  applicationName: siteConfig.brandName,
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f4f1e6",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body>
        {/*
          Film grain. Fixed, decorative, pointer-events none — it sits over the
          page the way grain sits over a print, and is never interactive.
        */}
        <div className="grain" aria-hidden="true" />

        <a className="skip-link" href="#main">
          Skip to main content
        </a>

        {/*
          Development notice. Renders only while the site is serving sample
          data, and disappears the moment a verified schedule feed is
          configured.
        */}
        {siteConfig.isFixtureMode ? (
          <div className="fixture-banner">
            <div className="wrap">
              <strong>Development build</strong>
              <span>
                Films, screenings and venue details on this site are sample data, not a real
                programme. No tickets can be bought here yet.
              </span>
            </div>
          </div>
        ) : null}

        <Rail />
        <SiteHeader />

        <main id="main">{children}</main>

        <SiteFooter />
        <RevealProvider />
      </body>
    </html>
  );
}
