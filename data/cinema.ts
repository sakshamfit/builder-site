/**
 * Venue facts for the cinema at Madhuban, Bihar.
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
 * WHERE THESE FACTS CAME FROM
 * ---------------------------
 * The town and state below were supplied directly by the venue owner
 * ("the cinema is in Madhuban, Bihar"). That is the strongest kind of evidence
 * this project accepts — the owner stating their own venue — and it is recorded
 * as such rather than dressed up as a public listing.
 *
 * Everything below the town level is still open: the street, the PIN code, the
 * entrance, hours, phone, screen names, accessibility provision, parking and
 * concessions have not been supplied, so each one renders as an open question.
 * A visitor travelling to a cinema needs the last two hundred metres right, and
 * those are exactly the facts this file does not yet have.
 *
 * Attribution: this site does not imply an official relationship with any mall,
 * chain or operator. See README "Brand and attribution".
 */

import type { ExternalLink, Venue } from "@/lib/types";

/** Resolves with the owner-confirmed value or null; never leaks a placeholder. */
export function factValue<T>(fact: { value: T | null; status: string }): T | null {
  return fact.status === "confirmed" ? (fact.value ?? null) : null;
}

export const venue: Venue = {
  id: "madhuban-bihar",
  /** Working name. Swap for the confirmed trade name when approved. */
  name: "Cinema at Madhuban",
  timezone: "Asia/Kolkata",

  address: {
    /**
     * The street address has not been supplied. Madhuban is a town, not a
     * building, and "Madhuban, Bihar" alone will not get someone to the right
     * door — so the street stays an open question rather than a guess.
     */
    street: {
      value: null,
      status: "pending",
      pendingNote:
        "The street address of the cinema has not been supplied yet. The town and state are confirmed; the road and landmark still need confirming so visitors can find the building.",
    },
    locality: {
      value: "Madhuban",
      status: "confirmed",
      source: "Supplied by the venue owner",
    },
    region: {
      value: "Bihar",
      status: "confirmed",
      source: "Supplied by the venue owner",
    },
    postalCode: {
      value: null,
      status: "pending",
      pendingNote:
        "The PIN code for the cinema's address has not been supplied. It is deliberately not guessed, because it is used for navigation and for post.",
    },
    country: {
      value: "India",
      status: "confirmed",
    },
    /**
     * A text query, NOT a coordinate pair. Publishing an exact pin before the
     * venue confirms its entrance would send visitors to the wrong door — so no
     * latitude/longitude ships in this project.
     */
    mapQuery: {
      value: "Madhuban, Bihar, India",
      status: "confirmed",
      source: "Derived from the confirmed town and state",
    },
    planningNote: {
      value: null,
      status: "pending",
      pendingNote:
        "Which road the cinema is on, which entrance to use and where to park still need confirmation from the venue. Allow extra time to find the building until this is supplied.",
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
   * The venue has not confirmed how its screens are named or how many it
   * operates, so this list is unused by the UI: `lib/schedule-source.ts` renders
   * no screens at all until a feed supplies real ones. It is kept as the shape a
   * feed's screen records take.
   */
  screens: [
    { id: "screen-1", name: "Screen 1", formats: ["2D"], accessibleFeatures: [] },
    { id: "screen-2", name: "Screen 2", formats: ["2D"], accessibleFeatures: [] },
    { id: "screen-3", name: "Screen 3", formats: ["2D"], accessibleFeatures: [] },
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
      label: "Parking",
      status: "pending",
      detail: "Parking provision, charges and proximity to the cinema entrance are unconfirmed.",
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
      detail: "Lift, ramp and ground-level access provision are unconfirmed.",
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
      pendingNote: "Parking arrangements and the closest drop-off point are not yet confirmed.",
    },
    transit: {
      value: null,
      status: "pending",
      pendingNote: "Nearest bus stops and the recommended drop-off point are not yet confirmed.",
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
        href: "https://www.google.com/maps/search/?api=1&query=Madhuban%2C%20Bihar%2C%20India",
        description: "Opens Google Maps with a search for Madhuban, Bihar.",
        /**
         * A search for the town, not a pinned cinema entrance, and the copy next
         * to it says so.
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
  const fromAddress = [
    { label: "Street address", note: venue.address.street.pendingNote ?? "" },
    { label: "PIN code", note: venue.address.postalCode.pendingNote ?? "" },
    { label: "Arrival and entrances", note: venue.address.planningNote.pendingNote ?? "" },
  ];

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

  const fromContact = [venue.contact.phone, venue.contact.email].map((fact) => ({
    label: "Contact details",
    note: fact.pendingNote ?? "",
  }));

  const fromArrival = [venue.arrival.parking, venue.arrival.transit, venue.arrival.entrance].map(
    (fact) => ({
      label: "Getting here",
      note: fact.pendingNote ?? "",
    }),
  );

  return [
    ...fromAddress,
    ...fromHours,
    ...fromFacilities,
    ...fromAccessibility,
    ...fromArrival,
    ...fromContact,
  ];
}
