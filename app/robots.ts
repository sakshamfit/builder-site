import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/metadata";

/**
 * robots.txt.
 *
 * The film programme is real, sourced and cited, so the pages that carry it are
 * worth indexing and are open to crawlers: a film's release date and its sources
 * are public facts, and a search result pointing at them is accurate.
 *
 * This is a change from the earlier build, where the catalogue was development
 * sample data and indexing it would have put invented films into search results.
 * That data is gone from the repository, so the reason for the blanket block is
 * gone with it.
 *
 * Before launch the owner must set NEXT_PUBLIC_SITE_URL to the production
 * domain; until then this file advertises the configured origin, which is the
 * only honest thing it can advertise.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
