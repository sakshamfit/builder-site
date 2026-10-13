/**
 * Primary navigation.
 *
 * Kept out of the header component so both the header and the footer can import
 * it without crossing a client boundary — the header is interactive, the footer
 * is fully static, and sharing the list must not turn the footer into a client
 * component.
 */
export type NavItem = { label: string; href: string; hint?: string };

export const NAV_ITEMS: NavItem[] = [
  { label: "Cinema", href: "/cinema", hint: "The hall, access and facilities" },
  { label: "Movies", href: "/movies", hint: "What's on" },
  { label: "Showtimes", href: "/#showtimes", hint: "Today onwards" },
  { label: "Offers", href: "/offers", hint: "Approved promotions" },
  { label: "Help", href: "/help", hint: "Booking and policies" },
];
