import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/metadata";

/**
 * robots.txt.
 *
 * Policy pages announced in the footer do not exist yet, and no page carries
 * approved policy copy. The site stays crawlable, but the schedule pages are
 * the only ones with real value before launch — and while sample data is on
 * screen, indexing it would put fictional films in search results.
 *
 * `NEXT_PUBLIC_DATA_MODE=fixture` therefore disallows crawling. Set it to
 * "live" with a real schedule before the site is indexed.
 */
export default function robots(): MetadataRoute.Robots {
  const isFixture = process.env.NEXT_PUBLIC_DATA_MODE !== "live";

  return {
    rules: isFixture
      ? [{ userAgent: "*", disallow: "/" }]
      : [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
