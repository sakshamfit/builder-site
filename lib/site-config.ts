/**
 * Site-wide configuration.
 *
 * Everything here is an owner decision, read from the environment at build
 * time. Nothing is invented: when a value is missing the site degrades to an
 * honest "not yet confirmed" state instead of guessing.
 *
 * See .env.example for the full list and README "Production configuration".
 */

export type DataMode = "fixture" | "live";

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

const dataModeRaw = readEnv(process.env.NEXT_PUBLIC_DATA_MODE).toLowerCase();
const dataMode: DataMode = dataModeRaw === "live" ? "live" : "fixture";

export const siteConfig = {
  /**
   * Working display name. Deliberately generic until the operator confirms the
   * official trade name — this site must not imply an official relationship
   * with the mall or with any ticketing company.
   */
  brandName: readEnv(process.env.NEXT_PUBLIC_BRAND_DISPLAY_NAME) || "Cinema at Elante Mall",

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

  /** "fixture" = labelled sample data. "live" = a verified operator feed. */
  dataMode,

  /**
   * True while the site is serving sample data. Drives the site-wide banner,
   * the per-card "sample" badges and the refusal to render booking links.
   */
  isFixtureMode: dataMode === "fixture",

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
    feedUrl: readEnv(process.env.SCHEDULE_FEED_URL),
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
