import Image from "next/image";
import Link from "next/link";
import { CinemaMedia } from "@/components/cinematic/CinemaMedia";
import { ReelButton } from "@/components/cinematic/ReelDialog";
import { ScrollCue } from "@/components/home/ScrollCue";
import { Button } from "@/components/ui/Button";
import { MOTION_MEDIA_CREDIT } from "@/data/media";
import { orbitTiles, plateSrc } from "@/lib/cinematic";
import { formatDateLong } from "@/lib/date-format";
import { siteConfig } from "@/lib/site-config";
import type { Movie } from "@/lib/types";
import styles from "./cinematic.module.css";

/**
 * Splits the configured brand name so the part after "at" can take the accent.
 * Derived from configuration: when the operator sets the confirmed trade name,
 * the opening scene follows it, and nothing is invented to fill a second line.
 */
function splitBrandName(name: string): string[] {
  const marker = name.toLowerCase().indexOf(" at ");
  if (marker === -1) return [name];
  return [name.slice(0, marker + 3).trim(), name.slice(marker + 4).trim()];
}

/**
 * The opening sequence.
 *
 * Adapted from the `.journey` scene in the owner's `gireeshkumarreddy/pk`
 * repository (ASSET_CREDITS.md §11): a full-screen film that, as the reader
 * scrolls, contracts through a circular mask into a ring of plates turning round
 * the venue's name; a crimson arc sweeps past, the velvet floods the stage for
 * two lines of type, and it parts on a single framed plate. The choreography is
 * upstream's, timed as upstream times it. The pictures and words are not:
 *
 *   - the film is this site's own render (data/media.ts), not footage;
 *   - the plates are this site's own cover art, decorative in the ring;
 *   - the framed plate is the next release in the programme, captioned with its
 *     real date and labelled as original cover art, not the film's poster;
 *   - the only numbers are counts of the programme record.
 *
 * Every layer is in the server HTML. Without JavaScript, or for a reader who
 * asks for reduced motion, the scene is a plain sequence of blocks read top to
 * bottom; `CinematicMotion` pins and choreographs it only once it has confirmed
 * motion is welcome, by setting `data-live` on the section.
 *
 * It scrolls natively throughout — nothing intercepts the wheel, nothing snaps —
 * and the header, the skip link and the "What's on" action stay usable at every
 * point, so a visitor who came for the timetable is never held by the show.
 */
export function CinematicJourney({
  place,
  todayISO,
  filmCount,
  lead,
}: {
  place: string;
  todayISO: string;
  /** How many films the programme lists; zero when it could not be read. */
  filmCount: number;
  /** The film the framed plate shows — the next release — or null. */
  lead: Movie | null;
}) {
  const [firstLine, secondLine] = splitBrandName(siteConfig.brandName);
  const words = siteConfig.brandName.trim().split(/\s+/).filter(Boolean);
  const markLead = words[0] ?? siteConfig.brandName;
  const markTail = words.slice(1).join(" ");
  const tiles = orbitTiles();
  const framed = lead?.artwork?.url ?? plateSrc("coco-2");
  const framedIsPlate = Boolean(framed?.startsWith("/cover-art/"));

  return (
    <section
      className={styles.journey}
      id="top"
      data-scene="journey"
      data-tone="dark"
      data-mode="night"
      aria-labelledby="hero-title"
    >
      <div className={styles.stage}>
        {/* --- the opening scene ------------------------------------------ */}
        <div className={styles.opening} data-j="opening">
          <CinemaMedia media="reel" priority className={styles.openingMedia} />
          <div className={styles.openingShade} data-j="shade" aria-hidden="true" />

          <div className={styles.heroCopy} data-j="copy">
            <p className={styles.kicker}>
              {place ? <span>{place}</span> : null}
              <span>{formatDateLong(todayISO)}</span>
            </p>

            <h1 className={styles.heroTitle} id="hero-title">
              <span className={styles.heroLine}>{firstLine}</span>
              {secondLine ? <span className={`${styles.heroLine} ${styles.heroAccent}`}>{secondLine}</span> : null}
            </h1>

            <p className={styles.heroText}>
              {filmCount > 0
                ? `${filmCount} films in the programme — every release date taken from a published calendar and cited where you read it.`
                : "The hall, the location, and the films on their way to it."}
            </p>

            <div className={styles.heroActions}>
              <Button href="#programme" variant="red">
                What&rsquo;s on <span aria-hidden="true">↓</span>
              </Button>
              <ReelButton className={styles.reelButton} />
            </div>
          </div>

          <p className={styles.heroCredit} data-j="credit">
            {MOTION_MEDIA_CREDIT}
          </p>

          <div className={styles.heroFooter} data-j="footer">
            <div className={styles.heroCue}>
              <ScrollCue />
            </div>
          </div>
        </div>

        {/* --- the velvet, the arc, the name and the ring ------------------- */}
        <div className={styles.field} data-j="field" aria-hidden="true" />
        <div className={styles.crescent} data-j="crescent" aria-hidden="true" />
        <div className={styles.mark} data-j="mark" aria-hidden="true">
          <span className={styles.markLead}>{markLead}</span>
          {markTail ? <span className={styles.markTail}>{markTail}</span> : null}
        </div>
        <div className={styles.orbit} data-j="orbit" aria-hidden="true">
          {tiles.map((tile, index) => (
            <div
              key={tile.src}
              className={styles.tile}
              data-j="tile"
              data-x={tile.x}
              data-y={tile.y}
              style={
                {
                  left: `${tile.x}%`,
                  top: `${tile.y}%`,
                  "--w": `${tile.width}%`,
                } as React.CSSProperties
              }
            >
              <Image src={tile.src} alt="" fill sizes="(max-width: 700px) 26vw, 190px" loading={index < 4 ? "eager" : "lazy"} />
            </div>
          ))}
        </div>

        {/* --- two lines on the velvet ------------------------------------- */}
        <div className={styles.manifesto} data-j="manifesto">
          <p className={styles.curtainKicker}>When the lights go down</p>
          <p className={styles.manifestoLine}>
            A hush. A beam of light.
            <br />A story, larger than life.
          </p>
        </div>

        <div className={styles.statement} data-j="statement">
          <p className={styles.statementLine}>The lights go down.</p>
          <p className={styles.curtainKicker}>{siteConfig.brandName}</p>
        </div>

        {/* --- one framed plate -------------------------------------------- */}
        <div className={styles.portrait} data-j="portrait">
          <div className={styles.frame}>
            <div className={styles.frameOutline} data-j="outline" aria-hidden="true" />
            <div className={styles.frameInner}>
              {framed ? (
                lead ? (
                  <Link
                    href={`/movies/${lead.slug}`}
                    className={styles.frameLink}
                    aria-label={`${lead.title} — the next release in the programme`}
                  >
                    <Image
                      src={framed}
                      alt={lead.artwork?.alt ?? ""}
                      fill
                      sizes="(max-width: 700px) 60vw, 340px"
                      className={styles.frameImage}
                      data-j="frameImage"
                    />
                  </Link>
                ) : (
                  <Image src={framed} alt="" fill sizes="(max-width: 700px) 60vw, 340px" className={styles.frameImage} data-j="frameImage" />
                )
              ) : null}
              <div className={styles.frameMask} data-j="mask" aria-hidden="true">
                <p>Some stories are made for the cinema.</p>
                <span>{lead ? "01 — The next release" : "01 — The programme"}</span>
              </div>
            </div>
          </div>

          {lead ? (
            <>
              <p className={`${styles.sideNote} ${styles.noteLeft}`}>
                <span>The next release</span>
                <span>{lead.releaseDate ? formatDateLong(lead.releaseDate) : "Date to be announced"}</span>
              </p>
              <p className={`${styles.sideNote} ${styles.noteRight}`}>
                <span>{lead.title}</span>
                <span>{framedIsPlate ? "Original cover art, not the film\u2019s poster" : lead.artwork?.licence}</span>
              </p>
            </>
          ) : null}

          <p className={styles.portraitWords} data-j="words" aria-hidden="true">
            <span data-j="word">The film.</span>
            <span data-j="word">The hall.</span>
            <span data-j="word">The night.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
