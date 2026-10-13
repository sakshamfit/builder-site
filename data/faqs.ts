/**
 * Help and policy content.
 *
 * Two kinds of answer live here:
 *
 *   status "confirmed" — describes how THIS WEBSITE behaves, which we can state
 *     truthfully because it is our own behaviour.
 *   status "pending"   — a venue policy (refunds, outside food, lost property)
 *     that the venue has not supplied. The UI shows the pending note instead of
 *     an answer. Never write a policy the venue has not approved.
 */

import type { Faq } from "@/lib/types";

export const faqs: Faq[] = [
  {
    id: "how-to-book",
    question: "How do I book tickets?",
    status: "confirmed",
    answer:
      "Choose a film, pick a date, and select a screening. The button on each screening hands you to the venue's ticketing partner, who completes seat selection and payment. Ticket links only appear once that partner has been confirmed and connected.",
  },
  {
    id: "seat-selection",
    question: "Can I choose my seats on this site?",
    status: "confirmed",
    answer:
      "No. This site is a venue website, not a booking engine. Seats, payment and confirmations belong to the authorised ticketing partner, and we link you straight there rather than imitating their checkout.",
  },
  {
    id: "no-card-details",
    question: "Do I enter my card details here?",
    status: "confirmed",
    answer:
      "Never. This site does not accept payment information and has no checkout. If a page asking for card details says it belongs to this cinema site, treat it as suspicious.",
  },
  {
    id: "prices",
    question: "What do tickets cost?",
    status: "pending",
    answer: "",
    pendingNote:
      "Ticket pricing is set by the venue and its ticketing partner and has not been supplied, so we do not publish any price. Prices appear against a screening only when the provider supplies them.",
  },
  {
    id: "availability",
    question: "How do I know a screening still has seats?",
    status: "pending",
    answer: "",
    pendingNote:
      "Live seat availability comes from the ticketing partner. Until that connection is live, this site cannot tell you how full a screening is.",
  },
  {
    id: "refunds",
    question: "Can I change or cancel a booking?",
    status: "pending",
    answer: "",
    pendingNote:
      "The venue's cancellation and refund policy has not been supplied. We do not summarise or paraphrase it, because getting it wrong would mislead you. Please ask at the cinema until it is published here.",
  },
  {
    id: "accessibility-support",
    question: "How do I arrange accessible seating or assistance?",
    status: "pending",
    answer: "",
    pendingNote:
      "We do not yet have confirmed accessibility contact details or an assisted-booking route for this cinema. They will be published here as soon as the venue supplies them.",
  },
  {
    id: "lost-property",
    question: "I left something behind at the cinema.",
    status: "pending",
    answer: "",
    pendingNote:
      "No lost-property contact or process has been supplied by the venue. Please contact the cinema directly.",
  },
  {
    id: "outside-food",
    question: "Can I bring my own food or drink?",
    status: "pending",
    answer: "",
    pendingNote:
      "Outside food and drink rules are set by the venue and have not been confirmed to us.",
  },
  {
    id: "languages",
    question: "Which languages and formats do you show?",
    status: "pending",
    answer: "",
    pendingNote:
      "Language and format availability is decided by each week's programme. The filters on the Movies page list only what the current schedule actually contains.",
  },
];

/** Booking-handoff help shown on the Help page. */
export const bookingHandoffSteps = [
  {
    title: "Find a screening",
    detail: "Open Movies, or start from today's screenings on the home page.",
  },
  {
    title: "Pick your date",
    detail:
      "The date bar shows the days this cinema is actually programming. Days outside that window are not offered.",
  },
  {
    title: "Read the screening details",
    detail:
      "Screen, format and language are shown as the venue states them. Nothing is inferred from the film's title.",
  },
  {
    title: "Continue to the ticketing partner",
    detail:
      "The handoff button carries the film, date and venue across, so you land on the right showing. Seat selection and payment finish there.",
  },
];

/** Shown when the schedule cannot be reached. */
export const scheduleUnavailableHelp = {
  title: "We cannot reach the schedule right now",
  detail:
    "This is a problem at our end, not with your booking. The rest of the site — location, directions and opening information — still works. Please try again in a few minutes.",
  supportNote:
    "If it stays unavailable, the fastest route is to contact the cinema directly or check the ticketing partner's own website.",
} as const;
