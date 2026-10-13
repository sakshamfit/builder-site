import Link from "next/link";
import { Button } from "@/components/ui/Button";

/**
 * Not found.
 *
 * Keeps the visitor moving: the three things a cinema site is used for are one
 * tap away, and the page never blames the user for a broken link.
 */
export default function NotFound() {
  return (
    <div className="wrap scene-pad">
      <p className="eyebrow">404</p>
      <h1 style={{ marginTop: "0.5rem" }}>We could not find that page</h1>
      <p className="lede" style={{ marginTop: "0.75rem" }}>
        The link may be out of date, or a film may have finished its run and left the programme.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginTop: "1.5rem" }}>
        <Button href="/movies" variant="red">
          See what is playing
        </Button>
        <Button href="/#showtimes" variant="outline">
          Today&rsquo;s showtimes
        </Button>
        <Button href="/cinema" variant="outline">
          Cinema and directions
        </Button>
      </div>

      <p className="small muted" style={{ marginTop: "2rem" }}>
        Still stuck? The <Link href="/help">help page</Link> explains how booking works at this
        cinema.
      </p>
    </div>
  );
}
