import type { Metadata } from "next";
import Link from "next/link";
import { bookingHandoffSteps, faqs, scheduleUnavailableHelp } from "@/data/faqs";
import { pendingFacts } from "@/data/cinema";
import { Badge } from "@/components/ui/Badge";
import { buildMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = buildMetadata({
  title: "Help, booking and policies",
  description:
    "How ticket handoff works, what this site can and cannot do, and which cinema policies are still awaiting confirmation.",
  path: "/help",
});

/**
 * Help.
 *
 * Two clearly separated kinds of answer: how this website behaves (which we can
 * state as fact) and what the venue's policies are (which we cannot, until they
 * are supplied). Nothing in between.
 *
 * The FAQ uses native <details>, so it is keyboard operable and screen-reader
 * friendly with no JavaScript at all.
 */
export default function HelpPage() {
  const outstanding = pendingFacts();

  return (
    <div className="container section">
      <div className="section-head">
        <div>
          <span className="eyebrow">Support</span>
          <h1>Help, booking and policies</h1>
          <p>
            How the ticket handoff works, what to expect, and the cinema policies still being
            confirmed.
          </p>
        </div>
      </div>

      <section aria-labelledby="how-booking-works" style={{ marginBottom: "2.5rem" }}>
        <h2 id="how-booking-works">How booking works here</h2>
        <p className="lede" style={{ marginTop: "0.5rem" }}>
          This is the cinema&rsquo;s venue website. It tells you what is playing and when, then hands
          you to the venue&rsquo;s ticketing partner to choose seats and pay.
        </p>

        <ol style={{ display: "grid", gap: "0.9rem", marginTop: "1.25rem", counterReset: "step" }}>
          {bookingHandoffSteps.map((step, index) => (
            <li key={step.title} className="surface" style={{ padding: "1rem 1.15rem" }}>
              <h3 style={{ fontSize: "1rem" }}>
                <span className="eyebrow" style={{ display: "inline-block", marginRight: "0.5rem" }}>
                  Step {index + 1}
                </span>
                {step.title}
              </h3>
              <p className="muted small" style={{ marginTop: "0.3rem" }}>
                {step.detail}
              </p>
            </li>
          ))}
        </ol>

        {siteConfig.isFixtureMode ? (
          <p className="note" style={{ marginTop: "1.25rem" }}>
            <span>
              <strong>In this build, the last step is disabled.</strong> The screenings you can see
              are sample data, so no ticket link is produced. Once the venue&rsquo;s provider is
              connected, each screening becomes a link that says{" "}
              <em>Continue to [ticketing partner]</em>.
            </span>
          </p>
        ) : null}
      </section>

      <section aria-labelledby="faq-title" style={{ marginBottom: "2.5rem" }}>
        <h2 id="faq-title">Questions</h2>
        <div style={{ display: "grid", gap: "0.5rem", marginTop: "1rem" }}>
          {faqs.map((faq) => (
            <details
              key={faq.id}
              className="surface"
              style={{ padding: "0.9rem 1.05rem", borderRadius: "var(--radius)" }}
            >
              <summary style={{ cursor: "pointer", fontWeight: 600 }}>
                {faq.question}{" "}
                {faq.status === "pending" ? <Badge tone="amber">Awaiting venue</Badge> : null}
              </summary>
              <div className="muted" style={{ marginTop: "0.6rem", maxWidth: "70ch" }}>
                {faq.status === "confirmed" ? (
                  <p>{faq.answer}</p>
                ) : (
                  <p>{faq.pendingNote}</p>
                )}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section aria-labelledby="outage-title" style={{ marginBottom: "2.5rem" }}>
        <h2 id="outage-title">If the schedule will not load</h2>
        <div className="note" style={{ marginTop: "0.75rem" }}>
          <div>
            <p>
              <strong>{scheduleUnavailableHelp.title}</strong>
            </p>
            <p style={{ marginTop: "0.4rem" }}>{scheduleUnavailableHelp.detail}</p>
            <p style={{ marginTop: "0.4rem" }}>{scheduleUnavailableHelp.supportNote}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="policies-title">
        <h2 id="policies-title">Policies</h2>
        <p className="lede" style={{ marginTop: "0.5rem" }}>
          Privacy, terms and accessibility statements will be published here once the venue approves
          their wording. Until then, no policy text is invented or paraphrased.
        </p>

        <h3 style={{ marginTop: "1.5rem", fontSize: "1.05rem" }}>
          Details we are still waiting on
        </h3>
        <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.75rem" }}>
          {outstanding.map((item, index) => (
            <p className="small muted" key={`${item.label}-${index}`}>
              <Badge tone="amber">Awaiting venue</Badge> {item.label}
            </p>
          ))}
        </div>

        <p className="small muted" style={{ marginTop: "1.5rem" }}>
          Looking for directions or accessibility information? It is on the{" "}
          <Link href="/cinema">cinema page</Link>.
        </p>
      </section>
    </div>
  );
}
