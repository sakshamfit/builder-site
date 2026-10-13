import type { ShowtimeView } from "@/lib/showtime-view";

/**
 * One consolidated explanation per group of screenings.
 *
 * When no screening in a group can be booked, saying so once — rather than on
 * every chip — keeps the listing readable while still being honest about what
 * the button would have done.
 */
export function HandoffNotice({ views }: { views: ShowtimeView[] }) {
  const anyBookable = views.some((view) => view.booking.kind === "ready");
  if (anyBookable || views.length === 0) return null;

  const firstUnavailable = views.find((view) => view.booking.kind === "unavailable");
  if (!firstUnavailable || firstUnavailable.booking.kind !== "unavailable") return null;

  const future = views.filter((view) => !view.hasStarted);
  if (future.length === 0) {
    return (
      <p className="note">
        <span>
          <strong>Today&apos;s screenings have finished.</strong> Choose another date above to see
          what is still to come.
        </span>
      </p>
    );
  }

  const { title, detail } = firstUnavailable.booking;

  return (
    <p className="note">
      <span>
        <strong>{title}.</strong> {detail}
      </span>
    </p>
  );
}
