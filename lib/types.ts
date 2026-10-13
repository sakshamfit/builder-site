/**
 * Shared domain types.
 *
 * Everything the UI renders is described here once, so the fixture data and a
 * future operator feed can be validated against the same contract.
 */

/** How confident we are in a piece of public information. */
export type FactStatus =
  /** Supplied or approved by the venue. Safe to state plainly. */
  | "confirmed"
  /** A placeholder that still needs owner sign-off. Always rendered as such. */
  | "pending";

/**
 * A public claim plus its verification state. Keeping the status next to the
 * value means a placeholder can never silently become a stated fact.
 */
export type Fact<T> = {
  value: T | null;
  status: FactStatus;
  /** Where this came from, e.g. "owner email 2026-10-14". Shown in build notes. */
  source?: string;
  /** Shown to the visitor instead of the value when status is "pending". */
  pendingNote?: string;
};

export type Language = {
  /** BCP-47-ish tag, e.g. "hi", "en", "pa". */
  code: string;
  /** Display label, e.g. "Hindi". */
  label: string;
};

/**
 * A presentation format. Formats are only ever listed on a film when the
 * operator's feed states them — this site never infers 3D/large-format from a
 * title. See README "Never claim a format we were not given".
 */
export type Format = "2D" | "3D" | "IMAX" | "4DX" | "ScreenX" | "Dolby Atmos";

export type MovieStatus = "now_showing" | "coming_soon";

export type Movie = {
  /** Stable identifier used in URLs and provider deep links. */
  slug: string;
  title: string;
  /** Only when the feed supplies one; otherwise null and the UI omits it. */
  originalTitle: string | null;
  status: MovieStatus;
  synopsis: string;
  languages: Language[];
  /** Whole minutes. Null when the source does not state a runtime. */
  runtimeMinutes: number | null;
  genres: string[];
  /**
   * Certification exactly as issued, with its issuing body, e.g.
   * { label: "U/A 13+", body: "CBFC" }. Never invented, never localised.
   */
  certification: { label: string; body: string } | null;
  formats: Format[];
  /** Path under /public. Must be a licensed asset before launch. */
  posterPath: string;
  /** Description of the poster for assistive tech. */
  posterAlt: string;
  /**
   * Release date for coming-soon titles when the operator states one.
   * ISO calendar date (no time), e.g. "2026-11-06".
   */
  releaseDate: string | null;
  /** Provenance of the artwork/text so nothing ships unlicensed unnoticed. */
  rights: {
    artwork: string;
    copy: string;
  };
};

/** Where a screen belongs in the venue. Screen identity comes from the venue. */
export type Screen = {
  id: string;
  /** Venue-supplied name. Fixtures use neutral working names. */
  name: string;
  /** Formats this screen can present, only as stated by the venue. */
  formats: Format[];
  /** Accessibility features confirmed for this screen. */
  accessibleFeatures: string[];
};

/** Provider-supplied availability. "unknown" is the honest default. */
export type Availability = "unknown" | "available" | "few_left" | "sold_out";

export type Showtime = {
  id: string;
  movieSlug: string;
  venueId: string;
  screenId: string;
  /** ISO 8601 with an explicit UTC offset, e.g. "2026-10-13T18:15:00+05:30". */
  startsAt: string;
  /** IANA zone the venue actually operates in. */
  timezone: string;
  languageCode: string;
  format: Format;
  /** Only ever set from provider data. Never guessed, never defaulted. */
  availability: Availability;
  /** Minor units (paise) so no floating-point money. Provider-supplied only. */
  priceMinor: number | null;
  currency: string | null;
  /** Provider's own id for this screening, echoed back on handoff. */
  providerShowtimeId: string | null;
  /** Whether this record is a development fixture or live provider data. */
  source: "fixture" | "live";
  /** Human-readable provenance, surfaced in the UI for fixture data. */
  provenance: string;
};

export type Venue = {
  id: string;
  /** Working name until the operator confirms the trade name. */
  name: string;
  timezone: string;
  address: VenueAddress;
  hours: HourRange[];
  screens: Screen[];
  facilities: Facility[];
  accessibility: Facility[];
  arrival: ArrivalInfo;
  contact: VenueContact;
};

export type VenueAddress = {
  street: Fact<string>;
  locality: Fact<string>;
  region: Fact<string>;
  postalCode: Fact<string>;
  country: Fact<string>;
  /** Human-readable map query. Not a pin — a pin needs verified coordinates. */
  mapQuery: Fact<string>;
  planningNote: Fact<string>;
};

export type HourRange = {
  label: string;
  value: Fact<string>;
};

export type Facility = {
  id: string;
  label: string;
  detail?: string;
  status: FactStatus;
};

export type ArrivalInfo = {
  parking: Fact<string>;
  transit: Fact<string>;
  entrance: Fact<string>;
};

export type VenueContact = {
  phone: Fact<string>;
  email: Fact<string>;
  /** External links (maps, transit) verified by the owner. */
  links: ExternalLink[];
};

export type ExternalLink = {
  id: string;
  label: string;
  href: string;
  description?: string;
  /** Verified destination vs. a link still awaiting owner confirmation. */
  status: FactStatus;
};

/** A promotion. Renders only when the venue has approved it. */
export type Offer = {
  id: string;
  title: string;
  summary: string;
  /** ISO calendar date the offer starts (inclusive). */
  validFrom: string;
  /** ISO calendar date the offer ends (inclusive). */
  validTo: string;
  terms: string[];
  approval: FactStatus;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  /** Answers derived from an unconfirmed policy are flagged, never implied. */
  status: FactStatus;
  pendingNote?: string;
};
