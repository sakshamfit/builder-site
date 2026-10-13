/**
 * Venue facts for the cinema at Elante Mall, Chandigarh.
 *
 * HOW TO READ THIS FILE
 * ---------------------
 * Every public claim carries a `status`:
 *
 *   "confirmed" — safe to state plainly on the site.
 *   "pending"   — not yet supplied/approved by the venue. The UI renders
 *                 `pendingNote` in its place and NEVER renders `value`.
 *
 * Nothing here is inferred. Where a value is unknown, `value` is null. That is
 * deliberate: an empty slot that the owner can fill is honest, whereas a
 * plausible-looking guess is a public claim the venue never made.
 *
 * Currently confirmed facts are limited to the mall-level location, which is
 * publicly documented. Everything specific to the cinema operation — its trade
 * name, hours, phone, screen names, accessibility provision, parking and
 * concession arrangements — is pending owner confirmation.
 *
 * Attribution: this site does not imply an official relationship with the mall
 * or with any cinema operator. See README "Brand and attribution".
 */

import type { ExternalLink, Venue } from "@/lib/types";

/** Resolves with the owner-confirmed value or null; never leaks a placeholder. */
export function factValue<T>(fact: { value: T | null; status: string }): T | null {
  return fact.status === "confirmed" ? (fact.value ?? null) : null;
}

export const venue: Venue = {
  id: "elante-chandigarh",
  /** Working name. Swap for the confirmed trade name when approved. */
  name: "Cinema at Elante Mall",
  timezone: "Asia/Kolkata",

  address: {
    street: {
      value: "178-178A, Purv Marg",
      status: "confirmed",
      source: "Publicly listed mall address",
    },
    locality: {
      value: "Industrial Area Phase I",
      status: "confirmed",
      source: "Publicly listed mall address",
    },
    region: {
      value: "Chandigarh",
      status: "confirmed",
      source: "Publicly listed mall address",
    },
    postalCode: {
      value: "160002",
      status: "confirmed",
      source: "Publicly listed mall address",
    },
    country: {
      value: "India",
      status: "confirmed",
    },
    /**
     * A text query, NOT a coordinate pair. Publishing an exact pin before the
     * venue confirms which entrance serves the cinema would send visitors to
     * the wrong door — so no latitude/longitude ships in this project.
     */
    mapQuery: {
      value: "Elante Mall, Purv Marg, Industrial Area Phase I, Chandigarh 160002",
      status: "confirmed",
      source: "Derived from the confirmed mall address",
    },
    planningNote: {
      value: null,
      status: "pending",
      pendingNote:
        "Which mall entrance to use, and which level the cinema sits on, still needs confirmation from the venue. Allow extra time for the walk from parking.",
    },
  },

  hours: [
    {
      label: "Cinema box office",
      value: {
        value: null,
        status: "pending",
        pendingNote: "Box office opening hours are not yet confirmed.",
      },
    },
    {
      label: "First and last screenings",
      value: {
        value: null,
        status: "pending",
        pendingNote:
          "Daily first and last show times are not yet confirmed. They vary by film and day, so they will be published once the schedule feed is connected.",
      },
    },
  ],

  /**
   * Working screen labels.
   *
   * The fixture schedule has to be assigned to *some* screen ids, but the venue
   * has not yet confirmed how its screens are named or how many it operates.
   * These labels are placeholders and the UI says so wherever they appear
   * (see components/cinema/ScreenLegend.tsx).
   */
  screens: [
    {
      id: "screen-1",
      name: "Screen 1",
      formats: ["2D"],
      accessibleFeatures: [],
    },
    {
      id: "screen-2",
      name: "Screen 2",
      formats: ["2D"],
      accessibleFeatures: [],
    },
    {
      id: "screen-3",
      name: "Screen 3",
      formats: ["2D"],
      accessibleFeatures: [],
    },
    {
      id: "screen-4",
      name: "Screen 4",
      formats: ["2D", "3D"],
      accessibleFeatures: [],
    },
  ],

  facilities: [
    {
      id: "concessions",
      label: "Food and drink counter",
      status: "pending",
      detail: "Menu, pricing and whether outside food is permitted are unconfirmed.",
    },
    {
      id: "parking",
      label: "Mall parking",
      status: "pending",
      detail: "Charges, validation and cinema-specific parking are unconfirmed.",
    },
    {
      id: "ticketing-desk",
      label: "On-site box office",
      status: "pending",
      detail: "Counter location, payment methods and card/UPI support are unconfirmed.",
    },
    {
      id: "cloakroom",
      label: "Bag and cloakroom facilities",
      status: "pending",
    },
  ],

  accessibility: [
    {
      id: "step-free",
      label: "Step-free access to the cinema",
      status: "pending",
      detail: "Lift and ramp provision from the mall levels is unconfirmed.",
    },
    {
      id: "wheelchair-spaces",
      label: "Wheelchair spaces in the auditorium",
      status: "pending",
      detail: "Seating allocation and companion seating are unconfirmed.",
    },
    {
      id: "assisted-audio",
      label: "Assisted audio or captioned screenings",
      status: "pending",
      detail: "Availability, equipment and how to request it are unconfirmed.",
    },
    {
      id: "accessible-washroom",
      label: "Accessible washrooms",
      status: "pending",
    },
  ],

  arrival: {
    parking: {
      value: null,
      status: "pending",
      pendingNote:
        "Mall parking charges and the closest parking to the cinema entrance are not yet confirmed.",
    },
    transit: {
      value: null,
      status: "pending",
      pendingNote:
        "Nearest bus stops and the recommended drop-off point are not yet confirmed.",
    },
    entrance: {
      value: null,
      status: "pending",
      pendingNote: "The cinema's own entrance is not yet confirmed.",
    },
  },

  contact: {
    phone: {
      value: null,
      status: "pending",
      pendingNote:
        "A public phone number for the cinema has not been supplied. Until it is, there is no number to call on this site.",
    },
    email: {
      value: null,
      status: "pending",
      pendingNote: "No public email address for the cinema has been supplied yet.",
    },
    links: [
      {
        id: "directions",
        label: "Get directions",
        href: "https://www.google.com/maps/search/?api=1&query=Elante%20Mall%2C%20Purv%20Marg%2C%20Industrial%20Area%20Phase%20I%2C%20Chandigarh%20160002",
        description: "Opens Google Maps with a search for the mall address.",
        /**
         * The search link itself is well-formed and points at the mall address.
         * It is not a venue-pinned location, and the site says so in the copy
         * that sits next to it.
         */
        status: "confirmed",
      },
    ],
  },
};

/** Known public links, kept separate so they are easy to audit. */
export const venueLinks: ExternalLink[] = venue.contact.links;

/**
 * Facts still outstanding, surfaced to the visitor as "still being confirmed"
 * rather than hidden. Owner sees the same list in the README.
 */
export function pendingFacts(): { label: string; note: string }[] {
  const fromAddress = [venue.address.planningNote].map((fact) => ({
    label: "Arrival and entrances",
    note: fact.pendingNote ?? "",
  }));

  const fromHours = venue.hours.map((hour) => ({
    label: hour.label,
    note: hour.value.pendingNote ?? "",
  }));

  const fromFacilities = venue.facilities
    .filter((facility) => facility.status === "pending")
    .map((facility) => ({
      label: facility.label,
      note: facility.detail ?? "Awaiting confirmation from the venue.",
    }));

  const fromAccessibility = venue.accessibility
    .filter((item) => item.status === "pending")
    .map((item) => ({
      label: item.label,
      note: item.detail ?? "Awaiting confirmation from the venue.",
    }));

  const fromContact = [venue.contact.phone, venue.contact.email]
    .map((fact) => ({
      label: "Contact details",
      note: fact.pendingNote ?? "",
    }));

  const fromArrival = [venue.arrival.parking, venue.arrival.transit, venue.arrival.entrance].map(
    (fact) => ({
      label: "Getting here",
      note: fact.pendingNote ?? "",
    }),
  );

  return [...fromAddress, ...fromHours, ...fromFacilities, ...fromAccessibility, ...fromArrival, ...fromContact];
}
