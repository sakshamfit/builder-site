/**
 * The only place this site talks to the outside world.
 *
 * SERVER ONLY. This module reads `SCHEDULE_FEED_URL` and `SCHEDULE_FEED_TOKEN`,
 * which must never reach the browser bundle. Nothing under `components/` imports
 * it, and nothing that imports it is marked `"use client"`. The credentials are
 * read here, used in a header, and never returned.
 *
 * WHAT IT DOES
 * ------------
 * Fetches the venue's schedule payload, validates it through `lib/feed.ts`, and
 * reports how old it is. It does not invent, cache forever, or paper over a
 * failure: if the partner is down, the caller gets an honest unavailable state
 * and the rest of the site keeps working.
 */

import { cache } from "react";
import { siteConfig } from "@/lib/site-config";
import { feedAgeHours, parseVenueFeed, type ParsedFeed } from "@/lib/feed";

/** Default freshness window before the schedule is labelled stale. */
const DEFAULT_STALE_AFTER_HOURS = 12;
/** Default edge/server revalidation window for the feed request. */
const DEFAULT_REVALIDATE_SECONDS = 300;
/** Hard ceiling on how long a partner request may take. */
const REQUEST_TIMEOUT_MS = 8_000;

export type FeedLoad =
  | {
      state: "ok";
      feed: ParsedFeed;
      /** Non-fatal problems found while parsing, for logs and /help. */
      warnings: string[];
      /** ISO instant the fetch completed. */
      fetchedAt: string;
      /** Age of the payload in hours, or null if it could not be computed. */
      ageHours: number | null;
      /** True when the payload is older than the configured window. */
      isStale: boolean;
      staleAfterHours: number;
    }
  | {
      state: "unavailable";
      /** Plain-language reason, safe to show a visitor. */
      reason: string;
      /** Operator-facing detail. Rendered in development only. */
      detail: string;
    };

function readPositiveNumber(raw: string | undefined, fallback: number): number {
  const parsed = Number((raw ?? "").trim());
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const feedSettings = {
  staleAfterHours: readPositiveNumber(
    process.env.SCHEDULE_STALE_AFTER_HOURS,
    DEFAULT_STALE_AFTER_HOURS,
  ),
  revalidateSeconds: readPositiveNumber(
    process.env.SCHEDULE_REVALIDATE_SECONDS,
    DEFAULT_REVALIDATE_SECONDS,
  ),
  /**
   * Hosts allowed to serve film artwork. Empty fails closed: no remote artwork is
   * accepted, and the feed reports which URLs it dropped and why.
   */
  artworkHostAllowlist: (process.env.POSTER_HOST_ALLOWLIST ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean),
} as const;

/**
 * Fetches and validates the live schedule.
 *
 * Memoised per request with React's `cache`, so a page that needs both the
 * programme and the venue's screens makes one network call, not two.
 */
export const loadFeed = cache(async (): Promise<FeedLoad> => {
  const url = siteConfig.ticketing.feedUrl;
  if (!url) {
    return {
      state: "unavailable",
      reason: "The verified schedule feed is not configured yet.",
      detail:
        'NEXT_PUBLIC_DATA_MODE is "live" but SCHEDULE_FEED_URL is empty, so there is nothing to fetch.',
    };
  }

  const headers: Record<string, string> = { accept: "application/json" };
  const token = (process.env.SCHEDULE_FEED_TOKEN ?? "").trim();
  if (token) headers.authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers,
      // Partner data, so it revalidates rather than being cached indefinitely.
      next: { revalidate: feedSettings.revalidateSeconds, tags: ["venue-feed"] },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown network error";
    return {
      state: "unavailable",
      reason: "We could not reach the cinema's schedule.",
      detail: `Request to the schedule feed failed: ${message}`,
    };
  }

  if (!response.ok) {
    return {
      state: "unavailable",
      reason: "The cinema's schedule is not responding right now.",
      detail: `Schedule feed returned HTTP ${response.status}${
        response.status === 401 || response.status === 403
          ? " — check SCHEDULE_FEED_TOKEN"
          : ""
      }.`,
    };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return {
      state: "unavailable",
      reason: "The cinema's schedule could not be read.",
      detail: "Schedule feed did not return valid JSON.",
    };
  }

  const result = parseVenueFeed(payload, {
    expectedVenueId: "elante-chandigarh",
    timezone: siteConfig.timezone,
    artworkHostAllowlist: [...feedSettings.artworkHostAllowlist],
  });

  if (!result.ok) {
    return {
      state: "unavailable",
      reason: "The cinema's schedule could not be read.",
      detail: `Schedule feed failed validation:\n  - ${result.errors.join("\n  - ")}`,
    };
  }

  const nowISO = new Date().toISOString();
  const age = feedAgeHours(result.feed.generatedAt, nowISO);

  return {
    state: "ok",
    feed: result.feed,
    warnings: result.warnings,
    fetchedAt: nowISO,
    ageHours: age,
    isStale: age === null || age > feedSettings.staleAfterHours,
    staleAfterHours: feedSettings.staleAfterHours,
  };
});

/**
 * Operator-facing health report: everything wrong with the current payload.
 *
 * Rendered on `/help` in development, and written to the build log, so a partner
 * integration problem is visible to whoever can fix it rather than only to the
 * visitor who cannot.
 */
export async function describeFeedHealth(): Promise<string | null> {
  const load = await loadFeed();
  if (load.state !== "ok") return `Schedule feed unavailable.\n${load.detail}`;

  const lines: string[] = [
    `Source: ${load.feed.sourceLabel}`,
    `Generated: ${load.feed.generatedAt} (${load.ageHours?.toFixed(1) ?? "?"}h old${
      load.isStale ? ", STALE" : ""
    })`,
    `Films: ${load.feed.movies.length}, screens: ${load.feed.screens.length}, screenings: ${load.feed.showtimes.length}`,
    `Artwork licence: ${load.feed.artworkLicence ?? "none declared"}`,
    `Artwork hosts allow-listed: ${
      feedSettings.artworkHostAllowlist.join(", ") || "none (all remote artwork refused)"
    }`,
  ];
  if (load.warnings.length > 0) {
    lines.push(`Warnings (${load.warnings.length}):`, ...load.warnings.map((w) => `  - ${w}`));
  }
  return lines.join("\n");
}
