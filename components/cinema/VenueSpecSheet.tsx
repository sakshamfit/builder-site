import { SpecSheet, type SpecEntry } from "@/components/cinema/SpecSheet";
import { venue } from "@/data/cinema";
import { SCREEN_NAMING_NOTE, confirmed, pendingNote } from "@/lib/cinema-content";

/**
 * The venue record, as a specification sheet.
 *
 * Every row is derived from a `Fact` in data/cinema.ts. A row shows a value only
 * when that fact is confirmed; otherwise it shows what is outstanding, in the
 * venue's own terms. Because the rows are generated rather than hand-written,
 * the sheet cannot drift out of step with the underlying record — filling in a
 * fact in data/cinema.ts is the only change needed to fill in a row.
 *
 * Rows for things the venue has never been asked about (capacity, projection
 * equipment, sound) are present on purpose. An empty row that names the missing
 * input is more useful to a visitor, and to the owner, than a claim.
 */
export function VenueSpecSheet({
  variant = "full",
  footnote,
}: {
  /** "summary" trims the sheet for the home page. */
  variant?: "full" | "summary";
  footnote?: string;
}) {
  const locality = confirmed(venue.address.locality);
  const region = confirmed(venue.address.region);
  const location = [locality, region].filter(Boolean).join(", ");

  const boxOffice = venue.hours[0];
  /*
   * Screen records carry no verification status of their own, and SCREEN_NAMING_NOTE
   * records that the auditorium naming is not the venue's. The auditorium row
   * therefore stays open: the venue has not stated a screen count, so no count is
   * printed here.
   */

  const all: SpecEntry[] = [
    {
      id: "location",
      label: "Location",
      value: location || null,
      pending: pendingNote(venue.address.locality),
      status: location ? "confirmed" : "pending",
    },
    {
      id: "timezone",
      label: "Schedule time zone",
      value: venue.timezone,
      pending: "Awaiting confirmation",
      status: "confirmed",
    },
    {
      id: "entrance",
      label: "Entrance and arrival",
      value: null,
      pending: pendingNote(venue.address.planningNote),
      status: "pending",
    },
    {
      id: "auditoriums",
      label: "Auditoriums",
      value: null,
      pending: `${SCREEN_NAMING_NOTE} No auditorium list is published here until it is supplied: naming screens a visitor cannot walk to would be worse than naming none.`,
      status: "pending",
    },
    {
      id: "formats",
      label: "Formats and projection",
      value: null,
      pending:
        "Projection and format provision is awaiting confirmation. No format, brand or certification is claimed here until the venue states it.",
      status: "pending",
    },
    {
      id: "seating",
      label: "Seating and capacity",
      value: null,
      pending:
        "Seat count, seating types and legroom are awaiting confirmation, along with which auditoriums offer what.",
      status: "pending",
    },
    {
      id: "sound",
      label: "Sound",
      value: null,
      pending:
        "Sound system details are awaiting confirmation. Trade names for audio systems are not used until the venue supplies them.",
      status: "pending",
    },
    {
      id: "box-office",
      label: "Box office hours",
      value: null,
      pending: pendingNote(boxOffice.value, "Box office opening hours are not yet confirmed."),
      status: "pending",
    },
  ];

  const entries = variant === "summary" ? all.slice(0, 5) : all;

  return (
    <SpecSheet
      title="Venue specification"
      entries={entries}
      footnote={
        footnote ??
        "Rows marked as outstanding are placeholders for information the venue has not yet supplied. Nothing here is estimated."
      }
    />
  );
}
