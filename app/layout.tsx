import type { Metadata, Viewport } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { siteConfig } from "@/lib/site-config";

/*
 * Self-hosted, OFL-1.1 licensed fonts (see ASSET_CREDITS.md).
 * Archivo ships a width axis, which is what gives the headings their condensed
 * poster feel; Inter carries the interface; JetBrains Mono keeps showtimes and
 * prices aligned column-wise.
 *
 * Imported here rather than fetched from a font CDN: no third-party request, no
 * layout shift, and the licence travels with the repository.
 */
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";

import "./globals.css";

export const metadata: Metadata = {
  // Resolves every relative OG/canonical URL against the configured domain.
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
  themeColor: "#07080c",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body>
        <a className="skip-link" href="#main">
          Skip to main content
        </a>

        {/*
          Development notice. Renders only while the site is serving sample
          data, and disappears the moment a verified schedule feed is
          configured. It sits above the header so it can never be scrolled past
          or mistaken for part of the programme.
        */}
        {siteConfig.isFixtureMode ? (
          <div className="fixture-banner">
            <div className="container">
              <p>
                <strong>Development build.</strong> Films, screenings and venue details on this site
                are sample data, not a real programme. No tickets can be bought here yet.
              </p>
            </div>
          </div>
        ) : null}

        <SiteHeader />

        <main id="main">{children}</main>

        <SiteFooter />
      </body>
    </html>
  );
}
