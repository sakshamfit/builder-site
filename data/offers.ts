/**
 * Approved promotions.
 *
 * Intentionally empty. No promotion may appear on this site until the venue
 * has approved its wording, dates and terms in writing — a offers page is a
 * contractual statement, not marketing filler.
 *
 * The shape of an approved entry is documented below so the owner can supply
 * one. When the list is empty, /offers renders an honest empty state instead of
 * placeholder discounts.
 *
 * Example of the expected input (do not uncomment without approval):
 *
 * {
 *   id: "weekday-morning",
 *   title: "Weekday morning screenings",
 *   summary: "Owner-approved wording goes here, exactly as supplied.",
 *   validFrom: "2026-11-01",
 *   validTo: "2026-11-30",
 *   terms: [
 *     "Valid for screenings starting before 12:00, Monday to Friday.",
 *     "Not valid on public holidays.",
 *   ],
 *   approval: "confirmed",
 * }
 */

import type { Offer } from "@/lib/types";

export const offers: Offer[] = [];

/** What the owner needs to supply for the offers page to go live. */
export const offersPendingInputs = [
  "The promotion's exact approved wording and headline",
  "Start and end dates, including whether it can be withdrawn early",
  "Eligibility rules: which screenings, days, screens or formats qualify",
  "Price, discount or benefit, stated in the same terms the venue advertises",
  "Who fulfils it — the venue, the ticketing partner, or a third party",
] as const;
