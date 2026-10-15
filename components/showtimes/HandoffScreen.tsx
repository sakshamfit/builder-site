import Link from "next/link";
import { SampleBadge, SampleNotice } from "@/components/ui/SampleBadge";
import {
  AccessibleIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  ClockIcon,
  ConciergeIcon,
  DeviceIcon,
  LiftIcon,
  LockIcon,
  PassIcon,
  PopcornIcon,
  RestroomIcon,
  ScreenIcon,
  ShieldIcon,
  TicketIcon,
} from "@/components/ui/icons";
import type { ScreeningDetail } from "@/lib/screening-detail";
import styles from "./handoff.module.css";

const ARRIVAL_GLYPH = [ClockIcon, LiftIcon, TicketIcon];
const LOGISTICS_GLYPH = [LiftIcon, RestroomIcon, PopcornIcon, AccessibleIcon];
const ASSURANCE_GLYPH = [ArrowUpRightIcon, ScreenIcon, DeviceIcon];

/**
 * The screening screen.
 *
 * Left column: what you are buying — the film, the auditorium, the time, the
 * format, the price range and the other slots that day. Right column: who
 * completes the sale, what that handoff means, and the single coral action that
 * leaves this site. Below it: how to arrive, where the terms live, and the route
 * the venue's staff give first-time visitors.
 *
 * Two things are load-bearing and must not be simplified away:
 *
 *   1. **The ticket action is whatever the ticketing boundary produced.** When no
 *      provider is confirmed this column states that, with the reason, instead
 *      of showing a button that cannot book. A sample screening says so in as
 *      many words.
 *   2. **A page of sample content says it is sample, once, above the fold and in
 *      the marker.** The design's copy is reproduced faithfully because the owner
 *      asked for it; the reader is told what they are looking at, because the
 *      alternative — a rehearsal timetable that reads like a real one — is worse
 *      than no page at all.
 */
export function HandoffScreen({ detail }: { detail: ScreeningDetail }) {
  const hold = detail.hold;

  return (
    <div className={`wrap ${styles.screen}`}>
      {detail.sample ? (
        <p className={styles.sampleRow}>
          <SampleBadge />
        </p>
      ) : null}

      {detail.sampleNotice ? <SampleNotice>{detail.sampleNotice}</SampleNotice> : null}

      {/* --- hold banner ---------------------------------------------------- */}
      <div className={styles.lockBanner}>
        <span className={styles.lockIcon}>
          <ClockIcon className={styles.lockIconGlyph} />
        </span>
        <div className={styles.lockBody}>
          <p className={styles.lockTitle}>{hold ? "Showtime locked" : "Screening from the venue feed"}</p>
          <p className={styles.lockSub}>
            {hold
              ? "Seat allotment holding time before release back to the general queue."
              : "This screening came from the venue's own ticketing system, with its real time, screen and price."}
          </p>
        </div>
        {hold ? (
          <span className={styles.lockTimer}>
            <span className={styles.lockTimerLabel}>{hold.label}</span>
            <span className={styles.lockTimerValue}>{hold.value}</span>
          </span>
        ) : null}
      </div>

      <div className={styles.columns}>
        {/* --- what you are buying ----------------------------------------- */}
        <section className={styles.mainPanel} aria-labelledby="screening-title">
          <div className={styles.posterRow}>
            <div className={styles.plate}>
              <span className={styles.plateCert}>{detail.certification ?? "Unrated"}</span>
              <span className={styles.plateKicker}>
                {detail.sample ? "Sample cover plate" : "Original cover plate"}
              </span>
              <span className={styles.plateTitle} aria-hidden="true">
                {detail.filmTitle}
              </span>
            </div>

            <div className={styles.detailCol}>
              <div className={styles.chips}>
                {detail.formats.map((format) => (
                  <span key={format} className="chip">
                    {format}
                  </span>
                ))}
                {detail.runtimeLabel ? <span className="chip">{detail.runtimeLabel}</span> : null}
              </div>

              <h1 className={styles.title} id="screening-title">
                {detail.filmTitle}
              </h1>
              <p className={styles.languageLine}>{detail.languageLine}</p>

              <div className={styles.infoGrid}>
                <div>
                  <span className={styles.infoLabel}>Auditorium &amp; venue</span>
                  <p className={styles.infoValue}>{detail.auditorium}</p>
                  <p className={styles.infoSub}>{detail.venueLine}</p>
                </div>
                <div>
                  <span className={styles.infoLabel}>{detail.dateLabel}</span>
                  <p className={styles.infoValue}>{detail.dateValue}</p>
                  {detail.doorsLine ? <p className={styles.infoSub}>{detail.doorsLine}</p> : null}
                </div>
              </div>

              {detail.screenSpecs ? (
                <div className={styles.specBox}>
                  <span className={`eyebrow ${styles.specHeading}`}>
                    <ScreenIcon className={styles.specGlyph} />
                    {detail.screenSpecsLabel}
                  </span>
                  <p className={styles.specBody}>{detail.screenSpecs}</p>
                </div>
              ) : null}

              {detail.priceRange ? (
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Standard ticket range</span>
                  <span className={styles.priceValue}>{detail.priceRange}</span>
                  {detail.priceNote ? <span className={styles.priceNote}>{detail.priceNote}</span> : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className={styles.altRow}>
            <span className={styles.altLabel}>Need a different timing today?</span>
            <Link className={styles.altLink} href={detail.filmHref}>
              Change film
              <ArrowRightIcon className={styles.altLinkGlyph} />
            </Link>
          </div>

          {detail.alternatives.length > 0 ? (
            <div className={styles.times}>
              {detail.alternatives.map((slot) => (
                <span
                  key={`${slot.time}-${slot.state}`}
                  className={[styles.timeChip, slot.selected ? styles.timeChipSelected : ""]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {slot.time}
                  <span className={styles.timeState}>
                    {slot.selected ? "Selected" : `${slot.format} · ${slot.state}`}
                  </span>
                </span>
              ))}
            </div>
          ) : null}
        </section>

        {/* --- who completes the sale --------------------------------------- */}
        <aside className={styles.sidePanel} aria-labelledby="partner-title">
          <span className={styles.sideKicker}>{detail.partner.kicker}</span>
          <h2 className={styles.sideHeading} id="partner-title">
            {detail.partner.heading}
          </h2>
          <p className={styles.sideBody}>{detail.partner.body}</p>

          <div className={styles.guarantee}>
            <span className={styles.guaranteeHead}>
              <ShieldIcon className={styles.guaranteeGlyph} />
              <span className={styles.guaranteeTitle}>{detail.partner.guaranteeTitle}</span>
            </span>
            <p className={styles.guaranteeBody}>{detail.partner.guaranteeBody}</p>
          </div>

          <div className={styles.assurances}>
            {detail.assurances.map((item, index) => {
              const Glyph = ASSURANCE_GLYPH[index % ASSURANCE_GLYPH.length];
              return (
                <span key={item.title} className={styles.assurance}>
                  <Glyph className={styles.assuranceGlyph} />
                  <span className={styles.assuranceTitle}>{item.title}</span>
                  <span className={styles.assuranceDetail}>{item.detail}</span>
                </span>
              );
            })}
          </div>

          <div className={styles.partnerAction}>
            {detail.handoff.kind === "ready" ? (
              <>
                <a
                  className={styles.partnerCta}
                  href={detail.handoff.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${detail.handoff.label} — opens ${detail.handoff.providerName} in a new tab`}
                >
                  <TicketIcon className={styles.partnerCtaGlyph} />
                  {detail.partner.cta}
                </a>
                <p className={styles.partnerCtaNote}>{detail.handoff.note}</p>
              </>
            ) : (
              <p className={styles.redirectLine}>
                <strong>{detail.handoff.title}.</strong> {detail.handoff.detail}
              </p>
            )}
            <p className={styles.redirectLine}>{detail.partner.redirectLine}</p>
          </div>

          <p className={styles.altDivider}>Or alternatively</p>

          <div className={styles.boxOffice}>
            <span className={styles.boxOfficeHead}>
              <span className={styles.boxOfficeTitle}>{detail.partner.boxOfficeTitle}</span>
              <span className={styles.boxOfficePlace}>{detail.partner.boxOfficePlace}</span>
            </span>
            <p className={styles.boxOfficeBody}>{detail.partner.boxOfficeBody}</p>
          </div>

          <p className={styles.operator}>
            <span className={styles.operatorLabel}>{detail.partner.operatorLabel}</span>
            <span className={styles.operatorValue}>{detail.partner.operator}</span>
          </p>

          <p className={styles.concierge}>
            <ConciergeIcon className={styles.conciergeGlyph} />
            <span className={styles.conciergeText}>{detail.partner.conciergeNote}</span>
            <Link className={styles.conciergeLink} href="/help">
              Concierge
            </Link>
          </p>
        </aside>
      </div>

      {/* --- arriving, parking, and where the terms live -------------------- */}
      <div className={styles.practical}>
        {detail.arrival.map((card, index) => {
          const Glyph = ARRIVAL_GLYPH[index % ARRIVAL_GLYPH.length];
          return (
            <section key={card.title} className={styles.practicalCard}>
              <Glyph className={styles.practicalGlyph} />
              <h3 className={styles.practicalTitle}>{card.title}</h3>
              <p className={styles.practicalBody}>{card.body}</p>
            </section>
          );
        })}
      </div>

      {/* --- how to reach the auditorium ----------------------------------- */}
      <section className={styles.logistics} aria-labelledby="logistics-title">
        <div className={styles.logisticsHead}>
          <div>
            <span className="eyebrow">{detail.logistics.kicker}</span>
            <h2 id="logistics-title">{detail.logistics.heading}</h2>
          </div>
          <p className={styles.logisticsBody}>{detail.logistics.body}</p>
        </div>

        <div className={styles.logisticsGrid}>
          {detail.logistics.cards.map((card, index) => {
            const Glyph = LOGISTICS_GLYPH[index % LOGISTICS_GLYPH.length];
            return (
              <div key={card.title} className={styles.logisticsCard}>
                <Glyph className={styles.practicalGlyph} />
                <h3 className={styles.logisticsTitle}>{card.title}</h3>
                <p className={styles.logisticsValue}>{card.value}</p>
                <p className={styles.logisticsNote}>{card.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {detail.trademarkNotice ? (
        <p className={`micro ${styles.trademark}`}>
          <LockIcon className={styles.trademarkGlyph} />
          {detail.trademarkNotice}
        </p>
      ) : null}

      {detail.sample ? (
        <p className={styles.sampleFootnote}>
          <PassIcon className={styles.trademarkGlyph} />
          Turn this screen into the real thing by pointing <code>SCHEDULE_FEED_URL</code> at the
          venue&apos;s feed: the same layout then renders the venue&apos;s own times, screens and
          prices, with the ticket action wired to the confirmed partner.
        </p>
      ) : null}
    </div>
  );
}
