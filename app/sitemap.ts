import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/metadata";
import { loadCatalogue } from "@/lib/catalogue";
import { readClock } from "@/lib/clock";

/**
 * Sitemap.
 *
 * Only routes that exist are listed. `lastModified` reflects the last build,
 * because the only genuinely time-dependent content here is the schedule, and
 * the schedule's own freshness is stated on the page.
 *
 * If the site is served before launch from a non-production host, set
 * NEXT_PUBLIC_SITE_URL so these entries do not advertise the wrong domain.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const clock = readClock();
  const lastModified = new Date(clock.nowISO);

  const staticRoutes: { path: string; priority: number; changeFrequency: "daily" | "weekly" }[] = [
    { path: "/", priority: 1, changeFrequency: "daily" },
    { path: "/movies", priority: 0.9, changeFrequency: "daily" },
    { path: "/cinema", priority: 0.7, changeFrequency: "weekly" },
    { path: "/offers", priority: 0.4, changeFrequency: "weekly" },
    { path: "/help", priority: 0.5, changeFrequency: "weekly" },
  ];

  /*
   * Film pages are listed only when the catalogue is actually available, so a
   * live site whose feed is down does not advertise URLs it cannot serve.
   */
  const catalogue = await loadCatalogue();
  const movieRoutes = catalogue.available
    ? catalogue.movies.map((movie) => ({
        url: absoluteUrl(`/movies/${movie.slug}`),
        lastModified,
        changeFrequency: "daily" as const,
        priority: 0.6,
      }))
    : [];

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...movieRoutes,
  ];
}
