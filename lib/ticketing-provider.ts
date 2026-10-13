/**
 * Ticketing provider boundary.
 *
 * This module is the ONLY place that knows how a visitor leaves this site to
 * buy a ticket. It exists so that swapping fixture data for a real provider is
 * a configuration change, not a rewrite — and so that the site can never
 * fabricate a booking state it cannot honour.
 *
 * Rules encoded here:
 *   1. While `dataMode` is "fixture", no booking link is produced at all. The
 *      UI shows an honest explanation instead.
 *   2. A deep link is only produced when the provider is named, the template is
 *      syntactically valid, and the resulting URL points at an allow-listed
 *      host over https.
 *   3. Nothing else is mocked. There is no seat map, no cart, no payment step
 *      and no success state anywhere in this project — seat selection and
 *      payment belong to the authorised provider.
 */

import { siteConfig } from "@/lib/site-config";
import { calendarDateInZone } from "@/lib/date-format";
import type { Showtime } from "@/lib/types";

/** Tokens a provider template is required to support. */
const REQUIRED_TOKENS = ["{movieId}", "{date}", "{venueId}"] as const;

/** Tokens we substitute when present. */
const OPTIONAL_TOKENS = ["{showtimeId}", "{format}", "{screenId}", "{language}"] as const;

export type BookingUnavailableReason =
  /** Sample data is on screen; linking out would send people to a dead end. */
  | "fixture-data"
  /** No provider has been confirmed for this venue yet. */
  | "no-provider"
  /** A provider is named but its deep-link template is missing or malformed. */
  | "template-invalid"
  /** The template resolved to somewhere the owner has not approved. */
  | "host-not-allowed"
  /**
   * The screening did not carry enough information to fill the template. This
   * is a programming or feed error, and it must fail closed: a URL with a
   * literal "{movieId}" in it is worse than no URL.
   */
  | "context-incomplete";

export type BookingHandoff =
  | {
      kind: "ready";
      href: string;
      providerName: string;
      /** Button label, e.g. "Continue to <provider>". */
      label: string;
      /** Supporting line shown under the button, for honesty about the handoff. */
      note: string;
    }
  | {
      kind: "unavailable";
      reason: BookingUnavailableReason;
      /** Short, plain-language headline. */
      title: string;
      /** What the visitor can do instead. */
      detail: string;
    };

export type BookingContext = {
  movieSlug: string;
  venueId: string;
  /** The screening being booked. */
  showtime: Showtime;
  timezone: string;
};

type TemplateInspection =
  | { ok: true; template: string }
  | { ok: false; reason: "template-invalid"; detail: string };

/** Structural check on the operator-supplied template, before substitution. */
export function inspectTemplate(template: string): TemplateInspection {
  if (!template) {
    return { ok: false, reason: "template-invalid", detail: "no template configured" };
  }

  // Reject unknown placeholders outright. A template with a token we do not
  // substitute would otherwise be sent to the provider with "{seatGroup}" (or
  // whatever) still in the URL.
  const known: string[] = [...REQUIRED_TOKENS, ...OPTIONAL_TOKENS];
  const present = template.match(/\{[^}]*\}/g) ?? [];
  const unsupported = [...new Set(present.filter((token) => !known.includes(token)))];

  if (unsupported.length > 0) {
    return {
      ok: false,
      reason: "template-invalid",
      detail: `template contains unsupported token(s): ${unsupported.join(", ")}`,
    };
  }

  const missing = REQUIRED_TOKENS.filter((token) => !template.includes(token));
  if (missing.length > 0) {
    return {
      ok: false,
      reason: "template-invalid",
      detail: `template is missing required token(s): ${missing.join(", ")}`,
    };
  }

  // The template contains placeholders, so validate it as a URL *after*
  // substituting obviously safe probe values.
  const probe = substitute(template, {
    movieId: "probe",
    date: "2026-01-01",
    venueId: "probe",
  });

  let url: URL;
  try {
    url = new URL(probe);
  } catch {
    return { ok: false, reason: "template-invalid", detail: "template is not a valid absolute URL" };
  }

  if (url.protocol !== "https:") {
    return { ok: false, reason: "template-invalid", detail: "template must use https" };
  }

  return { ok: true, template };
}

function substitute(
  template: string,
  values: Partial<Record<string, string>>,
): string {
  let output = template;
  for (const [token, value] of Object.entries(values)) {
    if (value === undefined) continue;
    output = output.split(`{${token}}`).join(encodeURIComponent(value));
  }
  return output;
}

/** Hostnames the owner has approved, with the site's own domain implied. */
function allowedHosts(): string[] {
  const hosts = new Set(siteConfig.ticketing.allowedHosts);
  try {
    hosts.add(new URL(siteConfig.siteUrl).hostname.toLowerCase());
  } catch {
    /* siteUrl is already normalised; nothing to add. */
  }
  return [...hosts];
}

/**
 * Resolves what the "book" action should do for one screening.
 * Call this from a server component and pass the result down as plain props.
 */
export function resolveBookingHandoff(context: BookingContext): BookingHandoff {
  const { showtime } = context;

  // (1) Fixture data never links out.
  if (showtime.source === "fixture" || siteConfig.isFixtureMode) {
    return {
      kind: "unavailable",
      reason: "fixture-data",
      title: "Online booking is not connected yet",
      detail:
        "These screenings are sample data for development, so there is nothing to book. Ticket links appear here once the venue's ticketing partner is connected.",
    };
  }

  // (2) A provider must be confirmed.
  const providerName = siteConfig.ticketing.providerName;
  if (!providerName) {
    return {
      kind: "unavailable",
      reason: "no-provider",
      title: "Booking opens at the venue",
      detail:
        "This venue's online ticketing partner has not been confirmed for this site yet, so no ticket link is offered here. Please book at the cinema.",
    };
  }

  // (3) The deep-link template must be structurally sound.
  const inspection = inspectTemplate(siteConfig.ticketing.urlTemplate);
  if (!inspection.ok) {
    return {
      kind: "unavailable",
      reason: "template-invalid",
      title: "Online booking is temporarily unavailable",
      detail:
        "The ticket link is not configured correctly, so we are not sending you to a page that might not work. Please book at the cinema and tell the venue about this message.",
    };
  }

  /**
   * Everything the substitution depends on must be present and non-empty before
   * we build a URL. Checked up front so a caller passing an incomplete context
   * fails loudly here rather than quietly producing a dead link.
   */
  const requiredContext: [string, string | undefined][] = [
    ["movieId", context.movieSlug],
    ["venueId", context.venueId],
    ["date", context.timezone],
    ["showtime.startsAt", showtime.startsAt],
  ];
  const missingContext = requiredContext
    .filter(([, value]) => typeof value !== "string" || value.trim() === "")
    .map(([label]) => label);

  if (missingContext.length > 0) {
    return {
      kind: "unavailable",
      reason: "context-incomplete",
      title: "Online booking is temporarily unavailable",
      detail:
        "We could not build a ticket link for this screening because some of its details were missing. Please book at the cinema and tell the venue about this message.",
    };
  }

  // A template that asks for the provider's own screening id cannot be filled
  // in unless the feed supplied one, and a literal "{showtimeId}" in a URL is
  // worse than no link at all.
  if (inspection.template.includes("{showtimeId}") && !showtime.providerShowtimeId) {
    return {
      kind: "unavailable",
      reason: "template-invalid",
      title: "Online booking is temporarily unavailable",
      detail:
        "The ticket link needs a screening reference that the schedule did not provide. Please book at the cinema and tell the venue about this message.",
    };
  }

  const values: Record<string, string> = {
    movieId: context.movieSlug,
    date: calendarDateInZone(new Date(showtime.startsAt), context.timezone),
    venueId: context.venueId,
    format: showtime.format,
    screenId: showtime.screenId,
  };
  if (showtime.providerShowtimeId) {
    values.showtimeId = showtime.providerShowtimeId;
  }
  // Language is only carried when the provider template asks for it.
  values.language = showtime.languageCode;

  const href = substitute(inspection.template, values);

  /**
   * Belt and braces: if any placeholder survived substitution, the link is
   * broken. Never hand a customer a URL pointing at "{movieId}".
   */
  const leftover = href.match(/\{[^}]*\}/g);
  if (leftover) {
    return {
      kind: "unavailable",
      reason: "context-incomplete",
      title: "Online booking is temporarily unavailable",
      detail:
        "We could not build a complete ticket link for this screening. Please book at the cinema and tell the venue about this message.",
    };
  }

  // (4) The result must stay inside the approved host list.
  let resolved: URL;
  try {
    resolved = new URL(href);
  } catch {
    return {
      kind: "unavailable",
      reason: "template-invalid",
      title: "Online booking is temporarily unavailable",
      detail: "The ticket link could not be resolved. Please book at the cinema.",
    };
  }

  const allowed = allowedHosts();
  if (!allowed.includes(resolved.hostname.toLowerCase())) {
    return {
      kind: "unavailable",
      reason: "host-not-allowed",
      title: "Online booking is temporarily unavailable",
      detail:
        "The ticket link points somewhere this site is not allowed to send you. Please book at the cinema.",
    };
  }

  return {
    kind: "ready",
    href: resolved.toString(),
    providerName,
    label: `Continue to ${providerName}`,
    note: `You will finish seat selection and payment on ${providerName}. We never handle card details here.`,
  };
}

/** Plain-language CTA label used when no provider is confirmed yet. */
export function bookingCtaLabel(): string {
  return siteConfig.ticketing.providerName
    ? `Continue to ${siteConfig.ticketing.providerName}`
    : "Book tickets";
}

/**
 * Integration note for the next engineer, kept next to the code it describes.
 *
 * To go live:
 *   1. Set NEXT_PUBLIC_TICKETING_PROVIDER_NAME to the confirmed trade name.
 *   2. Set NEXT_PUBLIC_TICKETING_URL_TEMPLATE to the provider's approved deep
 *      link, keeping {movieId}, {date} and {venueId} (add {showtimeId} when the
 *      provider returns one).
 *   3. Set NEXT_PUBLIC_TICKETING_ALLOWED_HOSTS to that provider's host.
 *   4. Replace data/showtimes.fixture.ts with a validated feed using
 *      lib/schedule.ts#validateShowtime, and flip NEXT_PUBLIC_DATA_MODE to
 *      "live".
 * Only then will a booking button render.
 */
export const TICKETING_INTEGRATION_HINT = "lib/ticketing-provider.ts";
