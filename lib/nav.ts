/**
 * Primary navigation.
 *
 * Kept out of the header component so both the header and the footer can import
 * it without crossing a client boundary — the header is interactive, the footer
 * is fully static, and sharing the list must not turn the footer into a client
 * component.
 *
 * The order and the wording follow the approved site design: what is playing,
 * when it is playing, what this place is like, how to get to it, what is on
 * offer, and where to ask. Every entry is a real page on this site — no label
 * points at a section that does not exist yet.
 */
export type NavItem = { label: string; href: string; hint?: string };

export const NAV_ITEMS: NavItem[] = [
  { label: "Movies", href: "/movies", hint: "What is playing, and when it releases" },
  { label: "Showtimes", href: "/showtimes", hint: "Today onwards, from the venue's feed" },
  { label: "Experience", href: "/experience", hint: "Screens, sound and the auditorium" },
  { label: "Location & Amenities", href: "/cinema", hint: "Getting there, and what is inside" },
  { label: "Offers", href: "/offers", hint: "Approved promotions only" },
  { label: "Help", href: "/help", hint: "Booking, policies and questions" },
];

/**
 * The footer's second and third link columns.
 *
 * Same rule as the navigation: these are real destinations, sorted by what a
 * visitor is trying to do, not a catalogue of pages. Sections that are waiting on
 * the venue — phones, lost property, corporate booking — are stated on the pages
 * they belong to rather than promised here.
 */
export const FOOTER_SECTIONS: { heading: string; items: { label: string; href: string }[] }[] = [
  {
    heading: "Visitor links",
    items: [
      { label: "Now showing", href: "/movies" },
      { label: "Today's showtimes", href: "/showtimes" },
      { label: "Screen formats", href: "/experience#formats" },
      { label: "Offers", href: "/offers" },
    ],
  },
  {
    heading: "Venue & access",
    items: [
      { label: "Location and directions", href: "/cinema#location" },
      { label: "Parking and access", href: "/cinema#access" },
      { label: "Facilities and accessibility", href: "/cinema#facilities" },
      { label: "Plan your visit", href: "/experience#visit" },
    ],
  },
  {
    heading: "Assistance & legal",
    items: [
      { label: "Ticket terms and handoff", href: "/help#tickets" },
      { label: "Classification and advisories", href: "/help#classification" },
      { label: "Accessibility enquiries", href: "/help#accessibility" },
      { label: "Ask the venue", href: "/help#contact" },
    ],
  },
];
