/**
 * Site-wide configuration.
 *
 * Everything here is an owner decision, read from the environment at build
 * time. Nothing is invented: when a value is missing the site degrades to an
 * honest "not yet confirmed" state instead of guessing.
 *
 * See .env.example for the full list and README "Production configuration".
 */

export type DataMode = "programme" | "live";

function readEnv(value: string | undefined): string {
  return (value ?? "").trim();
}

function readList(value: string | undefined): string[] {
  return readEnv(value)
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

const DEFAULT_SITE_URL = "http://localhost:3000";

/**
 * Normalised public site URL. Used for canonical links, the sitemap and social
 * previews, so a malformed value would ship broken metadata — hence the guard.
 */
function resolveSiteUrl(raw: string): string {
  const candidate = raw || DEFAULT_SITE_URL;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return DEFAULT_SITE_URL;
    }
    return url.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

const feedUrl = readEnv(process.env.SCHEDULE_FEED_URL);
const dataModeRaw = readEnv(process.env.NEXT_PUBLIC_DATA_MODE).toLowerCase();

/**
 * Live mode is only entered when both switches are set.
 *
 * Choosing "live" without a feed URL would flip the site into a mode whose only
 * possible output is "the schedule could not be read", so it is treated as
 * configuration that has not finished — the site stays on the sourced programme
 * and keeps working. There is no third mode and no fallback data: the sourced
 * programme is real film data, and the feed is real schedule data. Neither one
 * pretends to be the other.
 */
const dataMode: DataMode = dataModeRaw === "live" && feedUrl ? "live" : "programme";

export const siteConfig = {
  /**
   * Working display name. Deliberately generic until the operator confirms the
   * official trade name — this site must not imply an official relationship
   * with the mall or with any ticketing company.
   */
  brandName: readEnv(process.env.NEXT_PUBLIC_BRAND_DISPLAY_NAME) || "Cinema at Madhuban",

  /**
   * Operator / mall attribution line. Empty until approved in writing.
   */
  attribution: readEnv(process.env.NEXT_PUBLIC_BRAND_ATTRIBUTION),

  /** Short form used where space is tight (mobile header). */
  brandShortName: readEnv(process.env.NEXT_PUBLIC_BRAND_SHORT_NAME) || "Cinema",

  siteUrl: resolveSiteUrl(readEnv(process.env.NEXT_PUBLIC_SITE_URL)),

  /**
   * The venue's operating timezone. Showtimes are stored with explicit offsets;
   * this controls display only.
   */
  timezone: readEnv(process.env.NEXT_PUBLIC_VENUE_TIMEZONE) || "Asia/Kolkata",

  /**
   * "programme" = the sourced national release calendar, which is real film data
   * but carries no screenings. "live" = the venue's own ticketing feed, which
   * carries the screenings. Live requires SCHEDULE_FEED_URL.
   */
  dataMode,

  /** True when the venue's feed is authoritative for this build. */
  isLiveMode: dataMode === "live",

  /**
   * True when the site can publish screening times at all. False on the sourced
   * programme, where the UI must say so rather than show an empty timetable.
   */
  hasScreeningSchedule: dataMode === "live",

  ticketing: {
    /** Display name of the confirmed provider. Empty = no booking button. */
    providerName: readEnv(process.env.NEXT_PUBLIC_TICKETING_PROVIDER_NAME),
    /** Deep-link template with {movieId}, {date}, {venueId} tokens. */
    urlTemplate: readEnv(process.env.NEXT_PUBLIC_TICKETING_URL_TEMPLATE),
    /** Hostnames the template is permitted to resolve to. */
    allowedHosts: readList(process.env.NEXT_PUBLIC_TICKETING_ALLOWED_HOSTS),
    /**
     * Server-only feed credentials. Never exposed to the browser bundle.
     */
    feedUrl,
  },
} as const;

export type SiteConfig = typeof siteConfig;

/** Truthful social/support copy: which facts are still outstanding. */
export const outstandingOwnerInputs = [
  "Confirmed cinema trade name, operator and approved mall attribution",
  "Official logo, brand colours and the production web domain",
  "Ticketing provider, live showtime API and approved deep-link format",
  "Verified address, entrance, hours, phone number and email",
  "Screen names, presenting formats and confirmed accessibility features",
  "Licensed poster and trailer assets for current and upcoming films",
  "Approved promotions, refund/cancellation policy wording and contact hours",
] as const;
