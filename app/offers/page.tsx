import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { offers, offersPendingInputs } from "@/data/offers";
import { buildMetadata } from "@/lib/metadata";
import { formatDateLong } from "@/lib/date-format";

export const metadata: Metadata = buildMetadata({
  title: "Offers",
  description:
    "Approved promotions at the cinema at Elante Mall, Chandigarh. Only venue-approved offers with confirmed dates and terms are published here.",
  path: "/offers",
});

/**
 * Offers.
 *
 * Empty until the venue approves something. Discount claims are a promise to a
 * customer and a commitment for the venue, so a placeholder promotion here
 * would be worse than a blank page — and a blank page with an explanation is
 * better than both.
 */
export default function OffersPage() {
  const approved = offers.filter((offer) => offer.approval === "confirmed");

  return (
    <div className="container section">
      <div className="section-head">
        <div>
          <span className="eyebrow">Promotions</span>
          <h1>Offers</h1>
          <p>
            Only promotions the venue has approved in writing appear on this page, with their dates
            and terms stated in full.
          </p>
        </div>
      </div>

      {approved.length === 0 ? (
        <EmptyState title="There are no approved offers right now">
          <p>
            No current promotion has been supplied and approved by the cinema, so this page is
            intentionally empty. We do not publish discounts, cashback or bundled deals that the
            venue has not confirmed, because you would only find out they were wrong at the counter.
          </p>
          <p>
            Cinema promotions are usually announced against the current programme — see what is on,
            or ask at the box office.
          </p>
          <Button href="/movies" variant="primary" size="small">
            See what is playing
          </Button>
        </EmptyState>
      ) : (
        <ul className="section--tight" style={{ display: "grid", gap: "1rem" }}>
          {approved.map((offer) => (
            <li className="surface" key={offer.id} style={{ padding: "1.25rem" }}>
              <h2 style={{ fontSize: "1.25rem" }}>{offer.title}</h2>
              <p className="muted" style={{ marginTop: "0.35rem" }}>
                Valid {formatDateLong(offer.validFrom)} to {formatDateLong(offer.validTo)}
              </p>
              <p style={{ marginTop: "0.6rem" }}>{offer.summary}</p>
              <h3 className="eyebrow" style={{ marginTop: "0.9rem" }}>
                Terms
              </h3>
              <ul style={{ marginTop: "0.4rem", display: "grid", gap: "0.3rem" }}>
                {offer.terms.map((term) => (
                  <li key={term} className="small muted">
                    · {term}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      <section className="note" style={{ marginTop: "1.75rem" }} aria-labelledby="offers-inputs">
        <div>
          <p id="offers-inputs">
            <strong>For the venue: what is needed to publish an offer.</strong>
          </p>
          <ul style={{ display: "grid", gap: "0.3rem", marginTop: "0.5rem" }}>
            {offersPendingInputs.map((input) => (
              <li key={input} className="small">
                · {input}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
