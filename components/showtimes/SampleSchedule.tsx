import Link from "next/link";
import { SampleBadge, SampleNotice } from "@/components/ui/SampleBadge";
import { ArrowRightIcon, CalendarIcon, ClockIcon } from "@/components/ui/icons";
import { sampleScreening } from "@/lib/sample-content";
import { placeLabel } from "@/lib/cinema-content";
import styles from "./handoff.module.css";

/**
 * The sample day.
 *
 * Shown on `/showtimes` only when the venue's feed is not connected and the
 * sample layer is on. It renders the design's screening as a timetable of one,
 * with its marker and its notice attached, so the page a visitor lands on is
 * never an empty box and never a real-looking timetable.
 *
 * Every chip here leads to the same route on purpose: there is exactly one
 * sample screening, and a selector that offers four days of nothing would be
 * four dead controls.
 */
export function SampleSchedule() {
  const place = placeLabel();

  return (
    <div className={styles.sampleBoard}>
      <p className={styles.sampleRow}>
        <SampleBadge />
      </p>
      <SampleNotice>
        This is the design&rsquo;s sample screening, kept here so the timetable view can be reviewed
        before the venue&rsquo;s feed is connected. It is not this cinema&rsquo;s programme: times,
        prices and formats are placeholders and are replaced by the feed&rsquo;s own records.
      </SampleNotice>

      <div className={styles.boardCard}>
        <div className={styles.boardHead}>
          <span className={styles.boardDate}>
            <CalendarIcon className={styles.boardGlyph} />
            Today · sample day
          </span>
          <span className={styles.boardPlace}>{place}</span>
        </div>

        <div className={styles.boardFilm}>
          <div className={styles.boardPlate}>
            <span className={styles.boardPlateTitle} aria-hidden="true">
              {sampleScreening.filmTitle}
            </span>
          </div>

          <div className={styles.boardDetail}>
            <div className={styles.chips}>
              {sampleScreening.formats.map((format) => (
                <span key={format} className="chip">
                  {format}
                </span>
              ))}
              <span className="chip">{sampleScreening.runtime}</span>
              <span className="chip">{sampleScreening.certification}</span>
            </div>

            <h3 className={styles.boardTitle}>{sampleScreening.filmTitle}</h3>
            <p className={styles.languageLine}>{sampleScreening.languageLine}</p>
            <p className={styles.infoSub}>
              {sampleScreening.auditorium} · {sampleScreening.doorsLine}
            </p>

            <div className={styles.times}>
              {sampleScreening.alternatives.map((slot) => (
                <Link
                  key={slot.time}
                  href="/showtimes/sample"
                  className={[styles.timeChip, slot.selected ? styles.timeChipSelected : ""]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <ClockIcon className={styles.altLinkGlyph} />
                  {slot.time}
                  <span className={styles.timeState}>{slot.state}</span>
                </Link>
              ))}
            </div>

            <Link className={styles.altLink} href="/showtimes/sample">
              Open the sample screening
              <ArrowRightIcon className={styles.altLinkGlyph} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
