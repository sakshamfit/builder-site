/**
 * Sample content — the approved design's own copy, kept in one file.
 *
 * WHY THIS EXISTS
 * ---------------
 * The owner supplied a design for this site ("Showtime & Handoff") and asked for
 * its copy to be reproduced so the built pages look like the comp. This module
 * is that copy, and it is the only place in the project where a value that the
 * venue has not confirmed is allowed to be rendered — which is why it is a
 * single file with a switch, and why everything read from it is printed behind
 * the `SAMPLE` marker (`components/ui/SampleBadge.tsx`).
 *
 * WHAT IT IS NOT
 * --------------
 * It is not a data source. `lib/schedule-source.ts` still has exactly two, and
 * neither of them is this: the sourced release calendar, and the venue's own
 * ticketing feed. No page mixes sample values into a real schedule, no sample
 * value is written into `data/`, and the moment a feed is connected the live
 * screenings replace this content on every screen that shows it.
 *
 * THE SWITCH
 * ----------
 *   NEXT_PUBLIC_SAMPLE_CONTENT="on"   → always render the sample screening
 *   NEXT_PUBLIC_SAMPLE_CONTENT="off"  → never render it
 *   unset                             → on in development, off in production
 *
 * The default matters: a production build with no feed should say that times are
 * not connected rather than show a rehearsal timetable that reads like a real
 * one. Development gets the design's screen, because that is what it is for.
 *
 * Names that this project cannot print as fact are still not printed here: the
 * partner line is rendered from configuration when a provider is named, and the
 * sample text describes the destination generically. A rehearsal page is allowed
 * to show false times; it is not allowed to invent a business relationship.
 */

import { readEnv } from "@/lib/env";

/** Whether the sample screening may be rendered in this build. */
export const SAMPLE_CONTENT_ENABLED: boolean = (() => {
  const configured = readEnv(process.env.NEXT_PUBLIC_SAMPLE_CONTENT).toLowerCase();
  if (configured === "on") return true;
  if (configured === "off") return false;
  return process.env.NODE_ENV !== "production";
})();

/** The label every sample value is rendered with. */
export const SAMPLE_LABEL = "Sample";

/**
 * The sentence that accompanies sample content wherever it appears. It says what
 * the values are, what they are for, and what replaces them.
 */
export const SAMPLE_NOTICE =
  "The screening below is design sample content, not this cinema's timetable. Times, prices, formats and seat states are placeholders drawn from the approved design, and they are replaced by the venue's own feed the moment it is connected.";

export type SampleTimeChip = {
  time: string;
  /** "Selected", "Fast filling", "Night owl" — the design's own state words. */
  state: string;
  selected?: boolean;
  /** The design's projection format for that slot. */
  format: string;
};

export type SampleScreening = {
  filmTitle: string;
  certification: string;
  formats: string[];
  runtime: string;
  languageLine: string;
  auditorium: string;
  screenSpecs: string;
  dateLine: string;
  doorsLine: string;
  priceRange: string;
  priceNote: string;
  holdLabel: string;
  holdValue: string;
  alternatives: SampleTimeChip[];
  partner: {
    kicker: string;
    heading: string;
    body: string;
    guaranteeTitle: string;
    guaranteeBody: string;
    assurances: { title: string; detail: string }[];
    cta: string;
    ctaNote: string;
    redirectLine: string;
    boxOfficeTitle: string;
    boxOfficePlace: string;
    boxOfficeBody: string;
    operatorLabel: string;
    operator: string;
    conciergeNote: string;
  };
  arrival: { title: string; body: string }[];
  logistics: { kicker: string; heading: string; body: string; cards: { title: string; value: string; body: string }[] };
  trademarkNotice: string;
};

/**
 * The rehearsal screening. Values are the design's, adapted only where the
 * design's copy named something this project must not state as fact.
 */
export const sampleScreening: SampleScreening = {
  filmTitle: "The Silent Horizon",
  certification: "U/A 13+",
  formats: ["Laser 3D", "12-channel audio"],
  runtime: "2h 42m",
  languageLine: "English original with English audio description & subtitles",
  auditorium: "Audi 1 · Level 3",
  screenSpecs:
    "Laser 70ft curved screen with custom 12-channel audio. Pre-sanitised dual-polarised 3D glasses issued at the Audi 1 entry turnstile.",
  dateLine: "Today · 05:15 pm",
  doorsLine: "Doors open at 04:55 pm",
  priceRange: "₹380 – ₹480",
  priceNote: "(Regular to Prime club)",
  holdLabel: "Hold expires in",
  holdValue: "07:57",
  alternatives: [
    { time: "01:45 pm", state: "Laser", format: "Laser 3D" },
    { time: "05:15 pm", state: "Selected", format: "Laser 3D", selected: true },
    { time: "08:30 pm", state: "Fast filling", format: "2D" },
    { time: "11:15 pm", state: "Night owl", format: "2D" },
  ],
  partner: {
    kicker: "Live transmission gateway",
    heading: "Continuing to ticket partner",
    body: "Live interactive seat layout, dynamic chair reservations, and authorised payment checkout are fulfilled through the venue's verified regional booking operator.",
    guaranteeTitle: "Integrity & anti-fraud guarantee",
    guaranteeBody:
      "This showcase portal does not collect card numbers, UPI PINs or bank credentials. All financial transactions take place inside the certified operator's checkout.",
    assurances: [
      { title: "256-bit SSL", detail: "Encrypted handoff" },
      { title: "Instant SMS / MMS", detail: "Ticket on the phone" },
      { title: "Direct gate pass", detail: "Scan at the turnstile" },
    ],
    cta: "Select seats on partner portal",
    ctaNote: "Opens the authorised gateway for this screening",
    redirectLine: "Ticket sales are completed by the venue's ticketing partner.",
    boxOfficeTitle: "Walk-in box office",
    boxOfficePlace: "Level 3 desk",
    boxOfficeBody:
      "Physical counter sales open daily from 10:00 am to 11:30 pm. Instant card and cash acceptance with printed souvenir tickets.",
    operatorLabel: "Fulfilment operator",
    operator: "The venue's ticketing partner",
    conciergeNote: "Need wheelchair or club seating assistance?",
  },
  arrival: [
    {
      title: "Timely arrival",
      body: "Doors open 20 minutes before the screening. Arrive by 04:55 pm to clear bag checks and collect 3D eyewear without missing the titles.",
    },
    {
      title: "Parking",
      body: "Present the cinema e-ticket at the concessions desk to stamp parking validation for the levels the venue operates.",
    },
    {
      title: "Direct fulfilment",
      body: "Cancellation, seat reallocation and coupons follow the authorised ticketing engine's terms, not this site's.",
    },
  ],
  logistics: {
    kicker: "Venue logistics",
    heading: "Level 3 pavilion · Cinema",
    body: "Dedicated lift cores and escalators deliver patrons directly to the auditorium the ticket names. The route below is the one the venue's own staff give first-time visitors.",
    cards: [
      {
        title: "Fastest lift",
        value: "Core B · near the food court",
        body: "Takes you directly to the Level 3 cinema entry.",
      },
      { title: "Restroom suites", value: "Audi 1 east corridor", body: "Touch-free faucets and private amenities." },
      {
        title: "Pre-booked F&B",
        value: "Express pickup counter 4",
        body: "Scan the partner order barcode to skip the standard line.",
      },
      {
        title: "Accessibility",
        value: "Step-free ramps & Row G slots",
        body: "Companion seating is arranged through the ticketing partner.",
      },
    ],
  },
  trademarkNotice:
    "Sample copy: IMAX® is a registered trademark of IMAX Corporation. Dolby Atmos® is a registered trademark of Dolby Laboratories.",
};

/**
 * The design's primary call to action, kept in one place so the rehearsal page
 * and the live page cannot drift apart in wording.
 */
export const SAMPLE_PRIMARY_ACTION = "Book tickets";
