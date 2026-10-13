/**
 * Presentation helpers for venue content.
 *
 * These exist so components never reach into `Fact` objects and accidentally
 * render an unconfirmed value. Call these instead.
 */

import { siteConfig } from "@/lib/site-config";
import { venue } from "@/data/cinema";
import type { Fact, FactStatus } from "@/lib/types";

/** The confirmed value, or null. Never returns a pending placeholder. */
export function confirmed<T>(fact: Fact<T>): T | null {
  return fact.status === "confirmed" && fact.value !== null ? fact.value : null;
}

/** The explanatory text shown in place of an unconfirmed value. */
export function pendingNote<T>(fact: Fact<T>, fallback = "Awaiting confirmation from the venue."): string {
  return fact.pendingNote ?? fallback;
}

export function isPending(fact: Fact<unknown> | { status: FactStatus }): boolean {
  return fact.status !== "confirmed";
}

/** Display name for the cinema. Working title until the trade name is approved. */
/**
 * Short place label for chips, rails and subtitles: "Madhuban, Bihar".
 *
 * Derived from the venue record rather than typed into each component. The header
 * and the left rail both used to carry a hardcoded town, which is how one stale
 * address survived a site-wide move.
 */
export function placeLabel(): string {
  return [confirmed(venue.address.locality), confirmed(venue.address.region)]
    .filter(Boolean)
    .join(", ");
}

export function brandName(): string {
  return siteConfig.brandName;
}

/**
 * Attribution line. Empty until the operator approves the wording, because an
 * unapproved attribution implies a relationship the venue has not granted.
 */
export function attributionLine(): string | null {
  return siteConfig.attribution || null;
}

/**
 * Address lines that are actually confirmed, in postal order. An address with
 * gaps renders only the parts that exist rather than inventing the rest.
 */
export function confirmedAddressLines(): string[] {
  const { street, locality, region, postalCode, country } = venue.address;
  const parts = [
    confirmed(street),
    confirmed(locality),
    confirmed(region),
    [confirmed(postalCode), confirmed(country)].filter(Boolean).join(" ").trim() || null,
  ];
  return parts.filter((part): part is string => Boolean(part && part.trim()));
}

/** True when there is enough confirmed address to show a postal address. */
export function hasConfirmedAddress(): boolean {
  return confirmedAddressLines().length >= 2;
}

/** The verified directions destination, if the owner has supplied one. */
export function directionsLink() {
  return venue.contact.links.find((link) => link.status === "confirmed") ?? null;
}

/**
 * A single sentence describing where this cinema is, built only from confirmed
 * parts. Returns null when there is nothing confirmed to say.
 */
export function venueLocationSentence(): string | null {
  const locality = confirmed(venue.address.locality);
  const region = confirmed(venue.address.region);
  if (!locality || !region) return null;
  if (locality === region) return `in ${region}`;
  return `in ${locality}, ${region}`;
}

/**
 * Ticket price display rule, stated once so every surface agrees: a price is
 * only ever shown when the provider supplied both an amount and a currency.
 * The formatting itself lives in lib/date-format.ts#formatPrice.
 */
export const PRICE_POLICY =
  "Prices are only shown when the ticketing partner supplies them for that screening.";

/** Availability display rule. */
export const AVAILABILITY_POLICY =
  "Live seat availability is confirmed by the ticketing partner at checkout.";

/**
 * Copy used wherever a screen name appears, because the venue has not yet
 * confirmed how its screens are named.
 */
export const SCREEN_NAMING_NOTE =
  "Screen names shown here are working labels until the venue confirms its auditorium naming.";
