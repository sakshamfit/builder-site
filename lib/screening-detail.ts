/**
 * The screening detail view model.
 *
 * One shape for the "Showtime & handoff" screen, filled from two places:
 *
 *   - `fromSampleScreening()` — the approved design's rehearsal page, rendered
 *     only behind the SAMPLE marker (`lib/sample-content.ts`);
 *   - `fromLiveShowtime()` — a real screening from the venue's feed, which is
 *     the only thing that can produce a bookable screening.
 *
 * Keeping both in one type is what stops the sample page and the real page from
 * drifting into two different designs. The `sample` flag is the only branch the
 * components make, and it exists to decide whether the sample marker prints —
 * never to change what the page claims.
 */

import {
  SAMPLE_NOTICE,
  sampleScreening,
  type SampleScreening,
  type SampleTimeChip,
} from "@/lib/sample-content";
import type { BookingHandoff } from "@/lib/ticketing-provider";
import type { ShowtimeView } from "@/lib/showtime-view";

export type Assurances = { title: string; detail: string }[];

/** What a handoff does, stated as instructions rather than vendor claims. */
export const MECHANISM_ASSURANCES: Assurances = [
  { title: "Leaves this site", detail: "Opens the partner's own site" },
  { title: "Live seats", detail: "Chosen on the partner's seat map" },
  { title: "Your pass", detail: "Issued and honoured by the operator" },
];

export type ScreeningDetail = {
  /** True when this page is the design's rehearsal content. */
  sample: boolean;
  /** The sample sentence, or null on a live screening. */
  sampleNotice: string | null;
  filmTitle: string;
  filmHref: string;
  certification: string | null;
  formats: string[];
  runtimeLabel: string | null;
  languageLine: string;
  auditorium: string;
  venueLine: string;
  screenSpecs: string | null;
  screenSpecsLabel: string;
  dateLabel: string;
  dateValue: string;
  doorsLine: string | null;
  priceRange: string | null;
  priceNote: string | null;
  hold: { label: string; value: string } | null;
  alternatives: SampleTimeChip[];
  /** Where the ticket action goes. Never invented: see lib/ticketing-provider.ts. */
  handoff: BookingHandoff;
  assurances: Assurances;
  /** The design's partner-column copy. */
  partner: SampleScreening["partner"];
  arrival: SampleScreening["arrival"];
  logistics: SampleScreening["logistics"];
  trademarkNotice: string | null;
};

const LOCK_COPY = {
  title: "Showtime locked",
  sub: "Seat allotment holding time before release back to the general queue.",
  specsLabel: "Screen specs & inclusions",
  auditoriumLabel: "Auditorium & venue",
  dateLabel: "Show date & time",
  priceLabel: "Standard ticket range",
  altLabel: "Need a different timing today?",
};

/**
 * The rehearsal page: the design's own screening, marked as sample.
 */
export function fromSampleScreening(venueLine: string): ScreeningDetail {
  const sample = sampleScreening;
  return {
    sample: true,
    sampleNotice: SAMPLE_NOTICE,
    filmTitle: sample.filmTitle,
    filmHref: "/movies",
    certification: sample.certification,
    formats: sample.formats,
    runtimeLabel: sample.runtime,
    languageLine: sample.languageLine,
    auditorium: sample.auditorium,
    venueLine,
    screenSpecs: sample.screenSpecs,
    screenSpecsLabel: LOCK_COPY.specsLabel,
    dateLabel: LOCK_COPY.dateLabel,
    dateValue: sample.dateLine,
    doorsLine: sample.doorsLine,
    priceRange: sample.priceRange,
    priceNote: sample.priceNote,
    hold: { label: sample.holdLabel, value: sample.holdValue },
    alternatives: sample.alternatives,
    handoff: {
      kind: "unavailable",
      reason: "not-from-feed",
      title: "No ticket link on a sample screening",
      detail:
        "Seat selection and payment open through the venue's ticketing partner on a real screening. This page shows the design, not a sale.",
    },
    assurances: sample.partner.assurances,
    partner: sample.partner,
    arrival: sample.arrival,
    logistics: sample.logistics,
    trademarkNotice: sample.trademarkNotice,
  };
}

/**
 * A real screening from the venue's feed.
 *
 * Everything printed here comes from the feed or from the venue record, and the
 * ticket action is whatever `lib/ticketing-provider.ts` produced — which is
 * "unavailable" until a provider is confirmed, with the reason rendered instead
 * of a button.
 */
export function fromLiveShowtime({
  view,
  movieTitle,
  movieHref,
  certification,
  runtimeLabel,
  venueLine,
  auditorium,
  doorsLine,
  dateValue,
  dateLabel,
  priceLabel,
}: {
  view: ShowtimeView;
  movieTitle: string;
  movieHref: string;
  certification: string | null;
  runtimeLabel: string | null;
  venueLine: string;
  auditorium: string;
  doorsLine: string | null;
  dateValue: string;
  dateLabel: string;
  priceLabel: string | null;
}): ScreeningDetail {
  return {
    sample: false,
    sampleNotice: null,
    filmTitle: movieTitle,
    filmHref: movieHref,
    certification,
    /** The feed's own format word. Never translated, never embellished. */
    formats: [view.format],
    runtimeLabel,
    languageLine: view.languageLabel,
    auditorium,
    venueLine,
    screenSpecs: null,
    screenSpecsLabel: LOCK_COPY.specsLabel,
    dateLabel,
    dateValue,
    doorsLine,
    priceRange: priceLabel,
    priceNote: null,
    hold: null,
    alternatives: [],
    handoff: view.booking,
    assurances: MECHANISM_ASSURANCES,
    partner: sampleScreening.partner,
    arrival: sampleScreening.arrival,
    logistics: sampleScreening.logistics,
    trademarkNotice: null,
  };
}

export { LOCK_COPY };
